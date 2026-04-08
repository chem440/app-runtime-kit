import { kv as vercelKv } from '@vercel/kv'
import { getMockRedis, resetMockRedis, shouldUseMockRedis } from './mock'
import { recordRedisOp } from './metrics'

const useMock = shouldUseMockRedis()
const rawKv = useMock ? getMockRedis() : vercelKv

const TRACKED_KV_OPS = new Set([
    'get', 'set', 'del', 'keys', 'mget',
    'sadd', 'srem', 'smembers', 'scard',
    'incr', 'incrby', 'expire',
])

const TRACKED_PIPELINE_OPS = new Set([
    'get', 'set', 'del', 'incrby', 'expire', 'sadd', 'srem', 'scard',
])

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

export const kv = new Proxy(rawKv as object, {
    get(target, prop, receiver) {
        const original = Reflect.get(target, prop, receiver)
        if (typeof prop !== 'string' || typeof original !== 'function') {
            return original
        }

        if (prop === 'pipeline') {
            return (...args: unknown[]) => {
                const startedAt = performance.now()
                try {
                    const pipeline = Reflect.apply(original, target, args)
                    recordRedisOp('pipeline', performance.now() - startedAt, false)
                    return makePipelineProxy(pipeline as object)
                } catch (error) {
                    recordRedisOp('pipeline', performance.now() - startedAt, true)
                    throw error
                }
            }
        }

        if (!TRACKED_KV_OPS.has(prop)) {
            return original.bind(target)
        }

        return async (...args: unknown[]) => {
            const startedAt = performance.now()
            try {
                const result = await Reflect.apply(original, target, args)
                recordRedisOp(prop, performance.now() - startedAt, false)
                return result
            } catch (error) {
                recordRedisOp(prop, performance.now() - startedAt, true)
                throw error
            }
        }
    },
}) as typeof rawKv

export { getMockRedis, resetMockRedis, shouldUseMockRedis }
