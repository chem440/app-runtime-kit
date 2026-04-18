import type { KVAdapter, KVPipeline } from '../cache/types';
declare class MockRedis implements KVAdapter {
    private store;
    private expiry;
    private callLog;
    private isExpired;
    private log;
    get<T = any>(key: string): Promise<T | null>;
    mget<T = any>(...keys: string[]): Promise<(T | null)[]>;
    set(key: string, value: any, options?: {
        ex?: number;
        nx?: boolean;
    }): Promise<'OK' | null>;
    setnx(key: string, value: any): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    setex(key: string, seconds: number, value: any): Promise<'OK'>;
    del(key: string): Promise<number>;
    hgetall<T = any>(key: string): Promise<T | null>;
    hget(key: string, field: string): Promise<string | null>;
    hmset(key: string, values: Record<string, any>): Promise<'OK'>;
    zrange(key: string, start: number, stop: number, options?: {
        rev?: boolean;
    }): Promise<string[]>;
    zadd(key: string, item: {
        score: number;
        member: string;
    }): Promise<number>;
    zrem(key: string, member: string): Promise<number>;
    zcard(key: string): Promise<number>;
    sadd(key: string, ...members: string[]): Promise<number>;
    scard(key: string): Promise<number>;
    smembers(key: string): Promise<string[]>;
    incr(key: string): Promise<number>;
    incrby(key: string, increment: number): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    pipeline(): KVPipeline;
    __reset(): void;
    __getCallLog(): {
        method: string;
        args: any[];
    }[];
    __getStore(): {
        [key: string]: any;
    };
    __setKey(key: string, value: any): void;
}
export declare function getMockRedis(): MockRedis;
export declare function resetMockRedis(): void;
export declare function shouldUseMockRedis(): boolean;
export type { MockRedis };
