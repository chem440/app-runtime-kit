/**
 * Generic telemetry key builders.
 *
 * These functions produce namespaced KV keys for telemetry data.
 * Apps define their own metric registries and extend telemetryKeys
 * with domain-specific event shapes.
 */
/** Key for per-user AI usage counters (tokens, cost, call counts). */
export function aiUsageKey(userId, metric) {
    return `ai:usage:${userId}:${metric}`;
}
/** Key for per-user feature capability tracking. */
export function capabilityKey(userId, capability) {
    return `telemetry:capability:${userId}:${capability}`;
}
/** Key for per-user page load tracking. */
export function pageLoadKey(userId, page) {
    return `telemetry:page:${userId}:${page}`;
}
/** Key for per-route API timing metrics. */
export function apiTimingKey(route) {
    return `telemetry:api:${route}`;
}
/** Key for tracking the last time a telemetry flush ran for a user. */
export function lastFlushKey(type, userId) {
    return `telemetry:${type}:${userId}:last_flush`;
}
/**
 * Generic telemetry key builders for cap enforcement events.
 * Apps extend this object with domain-specific event namespaces.
 */
export const telemetryKeys = {
    caps: {
        /** Cap enforcement rejection — user exceeded a limit. */
        rejected: (capType, tierId) => `caps:rejected:${capType}:${tierId}`,
        /** Cap warning shown to user before hitting the limit. */
        warning: (capType) => `caps:warning:${capType}`,
        /** User clicked upgrade from a cap-related prompt. */
        upgradeClick: (capType) => `caps:upgrade_click:${capType}`,
        /** Weekly cap reset completed. */
        weeklyReset: () => 'caps:weekly_reset',
    },
};
