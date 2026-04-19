import type { KVAdapter } from './types';
import { getMockKV, resetMockKV, shouldUseMockKV } from './mock';
/**
 * Register the cache client implementation.
 * Call once at application startup before any kv access.
 * Accepts any object satisfying KVAdapter — not tied to a specific provider.
 */
export declare function initKV(client: KVAdapter): void;
/**
 * Instrumented KV client.
 * - In test environments (MOCK_CACHE=1): backed by in-memory MockKV
 * - In all other environments: backed by whatever client was passed to initKV()
 *
 * Construction is deferred to first use so importing this module in tests
 * without initKV being called does not throw.
 */
export declare const kv: KVAdapter;
export { getMockKV, resetMockKV, shouldUseMockKV };
export type { KVAdapter, KVPipeline } from './types';
