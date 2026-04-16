import { Redis } from '@upstash/redis'
import { getMockRedis, resetMockRedis, shouldUseMockRedis } from './mock'
import { recordRedisOp } from './metrics'

// --- ADAPTER CONSTRUCTION ---

function createUpstashRedis(): Redis {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN
    if (!url || !token) {
        throw new Error('[cache] KV_REST_API_URL and KV_REST_API_TOKEN must be set')
    }
    return new Redis({ url, token })
}

const TRACKED_KV_OPS = new Set([
    'get', 'set', 'del', 'keys', 'mget',
    'sadd', 'srem', 'smembers', 'scard',
    'incr', 'incrby', 'expire',
])

const TRACKED_PIPELINE_OPS = new Set([
    'get', 'set', 'del', 'incrby', 'expire', 'sadd', 'srem', 'scard',
])

// --- INSTRUMENTATION WRAPPERS ---

function makePipelineProxy<T extends object>(pipeline: T): T {
    let proxy: T

    proxy = new Proxy(pipeline, {
        get(target, prop, receiver) {
            const original = Reflect.get(target, prop, receiver)
            if (typeof prop !== 'string' || typeof original !== 'function') {
                return original
            }

            if (prop === 'exec') {
                return async (...args: unknown[]) => {
                    const startedAt = performance.now()
                    try {
                        const result = await Reflect.apply(original, target, args)
                        recordRedisOp('pipeline.exec', performance.now() - startedAt, false)
                        return result
                    } catch (error) {
                        recordRedisOp('pipeline.exec', performance.now() - startedAt, true)
                        throw error
                    }
                }
            }

            if (!TRACKED_PIPELINE_OPS.has(prop)) {
                return original.bind(target)
            }

            return (...args: unknown[]) => {
                const startedAt = performance.now()
                try {
                    const result = Reflect.apply(original, target, args)
                    recordRedisOp(`pipeline.${prop}`, performance.now() - startedAt, false)
                    return result === target ? proxy : result
                } catch (error) {
                    recordRedisOp(`pipeline.${prop}`, performance.now() - startedAt, true)
                    throw error
                }
            }
        },
    })

    return proxy
}

// --- EXPORTS ---

// Lazy singleton — deferred so module import doesn't throw in test environments
// where KV_REST_API_URL/TOKEN are not set. Real client is constructed on first use.
let _instance: ReturnType<typeof getMockRedis> | Redis | null = null

function getInstance(): ReturnType<typeof getMockRedis> | Redis {
    if (!_instance) {
        _instance = shouldUseMockRedis() ? getMockRedis() : createUpstashRedis()
    }
    return _instance
}

/**
 * Instrumented Redis client.
 * - In test environments (MOCK_REDIS=1): backed by in-memory MockRedis
 * - In all other environments: backed by Upstash Redis via KV_REST_API_URL/TOKEN
 *
 * Construction is deferred to first use so importing this module in tests
 * without KV credentials set does not throw.
 */
export const kv = new Proxy({} as Redis, {
    get(_target, prop, receiver) {
        const instance = getInstance()
        const value = Reflect.get(instance, prop, instance)
        if (typeof prop !== 'string' || typeof value !== 'function') {
            return value
        }

        if (prop === 'pipeline') {
            return (...args: unknown[]) => {
                const startedAt = performance.now()
                try {
                    const pipeline = Reflect.apply(value, instance, args)
                    recordRedisOp('pipeline', performance.now() - startedAt, false)
                    return makePipelineProxy(pipeline as object)
                } catch (error) {
                    recordRedisOp('pipeline', performance.now() - startedAt, true)
                    throw error
                }
            }
        }

        if (!TRACKED_KV_OPS.has(prop)) {
            return value.bind(instance)
        }

        return async (...args: unknown[]) => {
            const startedAt = performance.now()
            try {
                const result = await Reflect.apply(value, instance, args)
                recordRedisOp(prop, performance.now() - startedAt, false)
                return result
            } catch (error) {
                recordRedisOp(prop, performance.now() - startedAt, true)
                throw error
            }
        }
    },
})

export { getMockRedis, resetMockRedis, shouldUseMockRedis }
