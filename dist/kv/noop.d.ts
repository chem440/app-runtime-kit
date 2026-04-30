import type { KVAdapter, KVPipeline } from './types';
/**
 * No-op KV adapter. Every call resolves immediately with the
 * "empty" value for its return type. Nothing is stored.
 *
 * Activated by DISABLE_CACHE=true — use when you want to run the
 * app without any cache/Redis dependency (local dev, etc.).
 */
declare class NoopKV implements KVAdapter {
    get<T = unknown>(): Promise<T | null>;
    mget<T = unknown>(...keys: string[]): Promise<(T | null)[]>;
    set(): Promise<'OK'>;
    setnx(): Promise<number>;
    setex(): Promise<'OK'>;
    del(): Promise<number>;
    expire(): Promise<number>;
    incr(): Promise<number>;
    incrby(): Promise<number>;
    hgetall<T = unknown>(): Promise<T | null>;
    hget(): Promise<string | null>;
    hmset(): Promise<'OK'>;
    zrange(): Promise<string[]>;
    zadd(): Promise<number>;
    zrem(): Promise<number>;
    zcard(): Promise<number>;
    sadd(): Promise<number>;
    scard(): Promise<number>;
    smembers(): Promise<string[]>;
    keys(): Promise<string[]>;
    pipeline(): KVPipeline;
}
export declare function getNoopKV(): NoopKV;
export declare function shouldDisableCache(): boolean;
export {};
