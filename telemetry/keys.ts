/**
 * Generic telemetry key builders.
 *
 * These functions produce namespaced KV keys for telemetry data.
 * Apps define their own metric registries and extend telemetryKeys
 * with domain-specific event shapes.
 */

/** Key for per-user AI usage counters (tokens, cost, call counts). */
export function aiUsageKey(userId: string, metric: string): string {
    return `ai:usage:${userId}:${metric}`
}

/** Key for per-user feature capability tracking. */
export function capabilityKey(userId: string, capability: string): string {
    return `telemetry:capability:${userId}:${capability}`
}

/** Key for per-user page load tracking. */
export function pageLoadKey(userId: string, page: string): string {
    return `telemetry:page:${userId}:${page}`
}

/** Key for per-route API timing metrics. */
export function apiTimingKey(route: string): string {
    return `telemetry:api:${route}`
}

/** Key for tracking the last time a telemetry flush ran for a user. */
export function lastFlushKey(type: string, userId: string): string {
    return `telemetry:${type}:${userId}:last_flush`
}

/**
 * Generic telemetry key builders for cap enforcement events.
 * Apps extend this object with domain-specific event namespaces.
 */
export const telemetryKeys = {
    caps: {
        /** Cap enforcement rejection — user exceeded a limit. */
        rejected: (capType: string, tierId: string): string =>
            `caps:rejected:${capType}:${tierId}`,
        /** Cap warning shown to user before hitting the limit. */
        warning: (capType: string): string =>
            `caps:warning:${capType}`,
        /** User clicked upgrade from a cap-related prompt. */
        upgradeClick: (capType: string): string =>
            `caps:upgrade_click:${capType}`,
        /** Weekly cap reset completed. */
        weeklyReset: (): string =>
            'caps:weekly_reset',
    },
} as const
