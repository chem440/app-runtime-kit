type KVOpStats = {
    calls: number
    errors: number
    totalMs: number
    maxMs: number
    samples: number[]
}

type KVMetricsState = {
    startedAt: string
    lastResetAt: string
    totalCalls: number
    totalErrors: number
    byOp: Record<string, KVOpStats>
}

const GLOBAL_KEY = '__LO_PLATFORM_KV_METRICS__'
const MAX_SAMPLES_PER_OP = 512

function nowIso(): string {
    return new Date().toISOString()
}

function createInitialState(): KVMetricsState {
    const ts = nowIso()
    return {
        startedAt: ts,
        lastResetAt: ts,
        totalCalls: 0,
        totalErrors: 0,
        byOp: {},
    }
}

function getState(): KVMetricsState {
    const globalObject = globalThis as typeof globalThis & {
        [GLOBAL_KEY]?: KVMetricsState
    }

    if (!globalObject[GLOBAL_KEY]) {
        globalObject[GLOBAL_KEY] = createInitialState()
    }
    return globalObject[GLOBAL_KEY] as KVMetricsState
}

function pushSample(samples: number[], value: number): number[] {
    if (samples.length >= MAX_SAMPLES_PER_OP) {
        samples.shift()
    }
    samples.push(value)
    return samples
}

function percentile(values: number[], p: number): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
    return sorted[index]
}

export function recordKVOp(op: string, durationMs: number, isError: boolean): void {
    const state = getState()
    state.totalCalls += 1
    if (isError) state.totalErrors += 1

    const prior = state.byOp[op]
    const stats: KVOpStats = {
        calls: typeof prior?.calls === 'number' ? prior.calls : 0,
        errors: typeof prior?.errors === 'number' ? prior.errors : 0,
        totalMs: typeof prior?.totalMs === 'number' ? prior.totalMs : 0,
        maxMs: typeof prior?.maxMs === 'number' ? prior.maxMs : 0,
        samples: Array.isArray(prior?.samples) ? prior.samples : [],
    }

    stats.calls += 1
    if (isError) stats.errors += 1
    stats.totalMs += durationMs
    if (durationMs > stats.maxMs) {
        stats.maxMs = durationMs
    }
    stats.samples = pushSample(stats.samples, durationMs)

    state.byOp[op] = stats
}

export function getKVMetricsSnapshot(): KVMetricsState & {
    byOpSummary: Record<string, {
        calls: number
        errors: number
        avgMs: number
        maxMs: number
        p50Ms: number
        p95Ms: number
        sampleCount: number
    }>
} {
    const state = getState()
    const copy = JSON.parse(JSON.stringify(state)) as KVMetricsState
    const byOpSummary: Record<string, {
        calls: number
        errors: number
        avgMs: number
        maxMs: number
        p50Ms: number
        p95Ms: number
        sampleCount: number
    }> = {}

    for (const [op, stats] of Object.entries(copy.byOp)) {
        byOpSummary[op] = {
            calls: stats.calls,
            errors: stats.errors,
            avgMs: stats.calls > 0 ? stats.totalMs / stats.calls : 0,
            maxMs: stats.maxMs,
            p50Ms: percentile(stats.samples, 50),
            p95Ms: percentile(stats.samples, 95),
            sampleCount: stats.samples.length,
        }
    }

    return {
        ...copy,
        byOpSummary,
    }
}

export function resetKVMetrics(): ReturnType<typeof getKVMetricsSnapshot> {
    const state = getState()
    state.lastResetAt = nowIso()
    state.totalCalls = 0
    state.totalErrors = 0
    state.byOp = {}
    return getKVMetricsSnapshot()
}
