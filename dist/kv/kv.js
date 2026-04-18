import { getMockRedis, resetMockRedis, shouldUseMockRedis } from './mock.js';
import { recordRedisOp } from './metrics.js';
const TRACKED_KV_OPS = new Set([
    'get', 'set', 'del', 'keys', 'mget',
    'sadd', 'srem', 'smembers', 'scard',
    'incr', 'incrby', 'expire',
]);
const TRACKED_PIPELINE_OPS = new Set([
    'get', 'set', 'del', 'incrby', 'expire', 'sadd', 'srem', 'scard',
]);
// --- INSTRUMENTATION WRAPPERS ---
function makePipelineProxy(pipeline) {
    let proxy;
    proxy = new Proxy(pipeline, {
        get(target, prop, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (typeof prop !== 'string' || typeof original !== 'function') {
                return original;
            }
            if (prop === 'exec') {
                return async (...args) => {
                    const startedAt = performance.now();
                    try {
                        const result = await Reflect.apply(original, target, args);
                        recordRedisOp('pipeline.exec', performance.now() - startedAt, false);
                        return result;
                    }
                    catch (error) {
                        recordRedisOp('pipeline.exec', performance.now() - startedAt, true);
                        throw error;
                    }
                };
            }
            if (!TRACKED_PIPELINE_OPS.has(prop)) {
                return original.bind(target);
            }
            return (...args) => {
                const startedAt = performance.now();
                try {
                    const result = Reflect.apply(original, target, args);
                    recordRedisOp(`pipeline.${prop}`, performance.now() - startedAt, false);
                    return result === target ? proxy : result;
                }
                catch (error) {
                    recordRedisOp(`pipeline.${prop}`, performance.now() - startedAt, true);
                    throw error;
                }
            };
        },
    });
    return proxy;
}
// --- EXPORTS ---
// Lazy singleton. In test environments (MOCK_REDIS=1) getInstance() auto-activates
// MockRedis without requiring initKV to be called. In production, initKV must be
// called before the first kv access.
let _instance = null;
/**
 * Register the Redis client implementation.
 * Call once at application startup before any kv access.
 * Accepts any object satisfying KVAdapter — not tied to a specific provider.
 */
export function initKV(client) {
    _instance = client;
}
function getInstance() {
    if (!_instance) {
        if (shouldUseMockRedis()) {
            _instance = getMockRedis();
            return _instance;
        }
        throw new Error('[cache] KV client not initialized. Call initKV(client) before accessing kv.');
    }
    return _instance;
}
/**
 * Instrumented KV client.
 * - In test environments (MOCK_REDIS=1): backed by in-memory MockRedis
 * - In all other environments: backed by whatever client was passed to initKV()
 *
 * Construction is deferred to first use so importing this module in tests
 * without initKV being called does not throw.
 */
export const kv = new Proxy({}, {
    get(_target, prop, receiver) {
        const instance = getInstance();
        const value = Reflect.get(instance, prop, instance);
        if (typeof prop !== 'string' || typeof value !== 'function') {
            return value;
        }
        if (prop === 'pipeline') {
            return (...args) => {
                const startedAt = performance.now();
                try {
                    const pipeline = Reflect.apply(value, instance, args);
                    recordRedisOp('pipeline', performance.now() - startedAt, false);
                    return makePipelineProxy(pipeline);
                }
                catch (error) {
                    recordRedisOp('pipeline', performance.now() - startedAt, true);
                    throw error;
                }
            };
        }
        if (!TRACKED_KV_OPS.has(prop)) {
            return value.bind(instance);
        }
        return async (...args) => {
            const startedAt = performance.now();
            try {
                const result = await Reflect.apply(value, instance, args);
                recordRedisOp(prop, performance.now() - startedAt, false);
                return result;
            }
            catch (error) {
                recordRedisOp(prop, performance.now() - startedAt, true);
                throw error;
            }
        };
    },
});
export { getMockRedis, resetMockRedis, shouldUseMockRedis };
