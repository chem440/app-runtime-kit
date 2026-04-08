declare class MockRedis {
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
    pipeline(): {
        get: (key: string) => /*elided*/ any;
        set: (key: string, value: any, options?: {
            ex?: number;
            nx?: boolean;
        }) => /*elided*/ any;
        setnx: (key: string, value: any) => /*elided*/ any;
        expire: (key: string, seconds: number) => /*elided*/ any;
        setex: (key: string, seconds: number, value: any) => /*elided*/ any;
        del: (key: string) => /*elided*/ any;
        hgetall: (key: string) => /*elided*/ any;
        hmset: (key: string, values: Record<string, any>) => /*elided*/ any;
        zadd: (key: string, item: {
            score: number;
            member: string;
        }) => /*elided*/ any;
        zrem: (key: string, member: string) => /*elided*/ any;
        zrange: (key: string, start: number, stop: number, options?: {
            rev?: boolean;
        }) => /*elided*/ any;
        zcard: (key: string) => /*elided*/ any;
        incr: (key: string) => /*elided*/ any;
        incrby: (key: string, increment: number) => /*elided*/ any;
        sadd: (key: string, ...members: string[]) => /*elided*/ any;
        scard: (key: string) => /*elided*/ any;
        exec: () => Promise<any[]>;
    };
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
