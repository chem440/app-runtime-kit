type KVOpStats = {
    calls: number;
    errors: number;
    totalMs: number;
    maxMs: number;
    samples: number[];
};
type KVMetricsState = {
    startedAt: string;
    lastResetAt: string;
    totalCalls: number;
    totalErrors: number;
    byOp: Record<string, KVOpStats>;
};
export declare function recordKVOp(op: string, durationMs: number, isError: boolean): void;
export declare function getKVMetricsSnapshot(): KVMetricsState & {
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
export declare function resetKVMetrics(): ReturnType<typeof getKVMetricsSnapshot>;
export {};
