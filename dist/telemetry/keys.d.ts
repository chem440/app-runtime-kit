/**
 * Generic telemetry key builders.
 *
 * These functions produce namespaced KV keys for telemetry data.
 * Apps define their own metric registries and extend telemetryKeys
 * with domain-specific event shapes.
 */
/** Key for per-user AI usage counters (tokens, cost, call counts). */
export declare function aiUsageKey(userId: string, metric: string): string;
/** Key for per-user feature capability tracking. */
export declare function capabilityKey(userId: string, capability: string): string;
/** Key for per-user page load tracking. */
export declare function pageLoadKey(userId: string, page: string): string;
/** Key for per-route API timing metrics. */
export declare function apiTimingKey(route: string): string;
/** Key for tracking the last time a telemetry flush ran for a user. */
export declare function lastFlushKey(type: string, userId: string): string;
/**
 * Generic telemetry key builders for cap enforcement events.
 * Apps extend this object with domain-specific event namespaces.
 */
export declare const telemetryKeys: {
    readonly caps: {
        /** Cap enforcement rejection — user exceeded a limit. */
        readonly rejected: (capType: string, tierId: string) => string;
        /** Cap warning shown to user before hitting the limit. */
        readonly warning: (capType: string) => string;
        /** User clicked upgrade from a cap-related prompt. */
        readonly upgradeClick: (capType: string) => string;
        /** Weekly cap reset completed. */
        readonly weeklyReset: () => string;
    };
};
