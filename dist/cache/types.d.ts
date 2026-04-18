export interface KVPipeline {
    get(key: string): this;
    set(key: string, value: unknown, options?: {
        ex?: number;
        nx?: boolean;
    }): this;
    incr(key: string): this;
    incrby(key: string, increment: number): this;
    expire(key: string, seconds: number): this;
    sadd(key: string, ...members: string[]): this;
    setex(key: string, seconds: number, value: unknown): this;
    exec(): Promise<unknown[]>;
}
export interface KVAdapter {
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, options?: {
        ex?: number;
        nx?: boolean;
    }): Promise<'OK' | null>;
    del(key: string): Promise<number>;
    mget<T = unknown>(...keys: string[]): Promise<(T | null)[]>;
    smembers(key: string): Promise<string[]>;
    scard(key: string): Promise<number>;
    sadd(key: string, ...members: string[]): Promise<number>;
    incr(key: string): Promise<number>;
    incrby(key: string, increment: number): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    setnx(key: string, value: unknown): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    pipeline(): KVPipeline;
}
