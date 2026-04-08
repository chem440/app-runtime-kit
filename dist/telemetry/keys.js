export function aiUsageKey(userId, metric) {
    return `ai:usage:${userId}:${metric}`;
}
export function capabilityKey(userId, capability) {
    return `telemetry:capability:${userId}:${capability}`;
}
export function pageLoadKey(userId, page) {
    return `telemetry:page:${userId}:${page}`;
}
export function apiTimingKey(route) {
    return `telemetry:api:${route}`;
}
export function lastFlushKey(type, userId) {
    return `telemetry:${type}:${userId}:last_flush`;
}
export const AI_USAGE_METRICS = [
    'openai:prompt_tokens',
    'openai:completion_tokens',
    'stt:duration_ms',
    'tts:chars',
    'calls',
];
export function getAllAIUsageKeys(userId) {
    return AI_USAGE_METRICS.map(metric => aiUsageKey(userId, metric));
}
export const telemetryKeys = {
    caps: {
        rejected: (capType, tierId) => `caps:rejected:${capType}:${tierId}`,
        warning: (capType) => `caps:warning:${capType}`,
        upgradeClick: (capType) => `caps:upgrade_click:${capType}`,
        weeklyReset: () => 'caps:weekly_reset',
    },
    billing: {
        plansViewed: (source) => `billing:plans_viewed:${source}`,
        checkoutStarted: (tierId, cycle) => `billing:checkout_started:${tierId}:${cycle}`,
        checkoutReturned: (outcome) => `billing:checkout_returned:${outcome}`,
        checkoutCompleted: (tierId, cycle, isUpgrade) => `billing:checkout_completed:${tierId}:${cycle}:${isUpgrade ? 'upgrade' : 'new'}`,
        checkoutAbandoned: (tierId, cycle) => `billing:checkout_abandoned:${tierId}:${cycle}`,
        confirmationMs: () => 'billing:confirmation_ms',
        confirmationTimeout: () => 'billing:confirmation_timeout',
    },
};
