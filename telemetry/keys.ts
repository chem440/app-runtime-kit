export function aiUsageKey(userId: string, metric: string): string {
    return `ai:usage:${userId}:${metric}`
}

export function capabilityKey(userId: string, capability: string): string {
    return `telemetry:capability:${userId}:${capability}`
}

export function pageLoadKey(userId: string, page: string): string {
    return `telemetry:page:${userId}:${page}`
}

export function apiTimingKey(route: string): string {
    return `telemetry:api:${route}`
}

export function lastFlushKey(type: string, userId: string): string {
    return `telemetry:${type}:${userId}:last_flush`
}

export const AI_USAGE_METRICS = [
    'openai:prompt_tokens',
    'openai:completion_tokens',
    'stt:duration_ms',
    'tts:chars',
    'calls',
] as const

export type AIUsageMetric = (typeof AI_USAGE_METRICS)[number]

export function getAllAIUsageKeys(userId: string): string[] {
    return AI_USAGE_METRICS.map(metric => aiUsageKey(userId, metric))
}

export const telemetryKeys = {
    caps: {
        rejected: (capType: string, tierId: string): string =>
            `caps:rejected:${capType}:${tierId}`,
        warning: (capType: string): string =>
            `caps:warning:${capType}`,
        upgradeClick: (capType: string): string =>
            `caps:upgrade_click:${capType}`,
        weeklyReset: (): string =>
            'caps:weekly_reset',
    },
    billing: {
        plansViewed: (source: 'settings' | 'cap_error' | 'pricing_route'): string =>
            `billing:plans_viewed:${source}`,
        checkoutStarted: (tierId: string, cycle: 'monthly' | 'yearly'): string =>
            `billing:checkout_started:${tierId}:${cycle}`,
        checkoutReturned: (outcome: 'success' | 'canceled'): string =>
            `billing:checkout_returned:${outcome}`,
        checkoutCompleted: (tierId: string, cycle: 'monthly' | 'yearly', isUpgrade: boolean): string =>
            `billing:checkout_completed:${tierId}:${cycle}:${isUpgrade ? 'upgrade' : 'new'}`,
        checkoutAbandoned: (tierId: string, cycle: 'monthly' | 'yearly'): string =>
            `billing:checkout_abandoned:${tierId}:${cycle}`,
        confirmationMs: (): string =>
            'billing:confirmation_ms',
        confirmationTimeout: (): string =>
            'billing:confirmation_timeout',
    },
} as const
