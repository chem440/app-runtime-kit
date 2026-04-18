import type { KVAdapter } from '../cache/types';
import { getMockRedis, resetMockRedis, shouldUseMockRedis } from './mock';
/**
 * Register the Redis client implementation.
 * Call once at application startup before any kv access.
 * Accepts any object satisfying KVAdapter — not tied to a specific provider.
 */
export declare function initKV(client: KVAdapter): void;
/**
 * Instrumented KV client.
 * - In test environments (MOCK_REDIS=1): backed by in-memory MockRedis
 * - In all other environments: backed by whatever client was passed to initKV()
 *
 * Construction is deferred to first use so importing this module in tests
 * without initKV being called does not throw.
 */
export declare const kv: KVAdapter;
export { getMockRedis, resetMockRedis, shouldUseMockRedis };
export type { KVAdapter, KVPipeline } from '../cache/types';
