type RedisOpStats = {
    calls: number;
    errors: number;
    totalMs: number;
    maxMs: number;
    samples: number[];
};
type RedisMetricsState = {
    startedAt: string;
    lastResetAt: string;
    totalCalls: number;
    totalErrors: number;
    byOp: Record<string, RedisOpStats>;
};
export declare function recordRedisOp(op: string, durationMs: number, isError: boolean): void;
export declare function getRedisMetricsSnapshot(): RedisMetricsState & {
    byOpSummary: Record<string, {
        calls: number;
        errors: number;
        avgMs: number;
        maxMs: number;
        p50Ms: number;
        p95Ms: number;
        sampleCount: number;
    }>;
};
export declare function resetRedisMetrics(): ReturnType<typeof getRedisMetricsSnapshot>;
export {};
