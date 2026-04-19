export interface KVPipeline {
    get(key: string): this
    set(key: string, value: unknown, options?: { ex?: number; nx?: boolean }): this
    setnx(key: string, value: unknown): this
    del(key: string): this
    hgetall(key: string): this
    hmset(key: string, values: Record<string, unknown>): this
    zadd(key: string, item: { score: number; member: string }): this
    zrem(key: string, member: string): this
    zrange(key: string, start: number, stop: number, options?: { rev?: boolean }): this
    zcard(key: string): this
    incr(key: string): this
    incrby(key: string, increment: number): this
    expire(key: string, seconds: number): this
    sadd(key: string, ...members: string[]): this
    scard(key: string): this
    setex(key: string, seconds: number, value: unknown): this
    exec(): Promise<unknown[]>
}

export interface KVAdapter {
    get<T = unknown>(key: string): Promise<T | null>
    set(key: string, value: unknown, options?: { ex?: number; nx?: boolean }): Promise<'OK' | null>
    del(key: string): Promise<number>
    mget<T = unknown>(...keys: string[]): Promise<(T | null)[]>
    hgetall<T = unknown>(key: string): Promise<T | null>
    hget(key: string, field: string): Promise<string | null>
    hmset(key: string, values: Record<string, unknown>): Promise<'OK'>
    zrange(key: string, start: number, stop: number, options?: { rev?: boolean }): Promise<string[]>
    zadd(key: string, item: { score: number; member: string }): Promise<number>
    zrem(key: string, member: string): Promise<number>
    zcard(key: string): Promise<number>
    smembers(key: string): Promise<string[]>
    scard(key: string): Promise<number>
    sadd(key: string, ...members: string[]): Promise<number>
    incr(key: string): Promise<number>
    incrby(key: string, increment: number): Promise<number>
    expire(key: string, seconds: number): Promise<number>
    setnx(key: string, value: unknown): Promise<number>
    keys(pattern: string): Promise<string[]>
    pipeline(): KVPipeline
}
