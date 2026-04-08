export declare function aiUsageKey(userId: string, metric: string): string;
export declare function capabilityKey(userId: string, capability: string): string;
export declare function pageLoadKey(userId: string, page: string): string;
export declare function apiTimingKey(route: string): string;
export declare function lastFlushKey(type: string, userId: string): string;
export declare const AI_USAGE_METRICS: readonly ["openai:prompt_tokens", "openai:completion_tokens", "stt:duration_ms", "tts:chars", "calls"];
export type AIUsageMetric = (typeof AI_USAGE_METRICS)[number];
export declare function getAllAIUsageKeys(userId: string): string[];
export declare const telemetryKeys: {
    readonly caps: {
        readonly rejected: (capType: string, tierId: string) => string;
        readonly warning: (capType: string) => string;
        readonly upgradeClick: (capType: string) => string;
        readonly weeklyReset: () => string;
    };
    readonly billing: {
        readonly plansViewed: (source: "settings" | "cap_error" | "pricing_route") => string;
        readonly checkoutStarted: (tierId: string, cycle: "monthly" | "yearly") => string;
        readonly checkoutReturned: (outcome: "success" | "canceled") => string;
        readonly checkoutCompleted: (tierId: string, cycle: "monthly" | "yearly", isUpgrade: boolean) => string;
        readonly checkoutAbandoned: (tierId: string, cycle: "monthly" | "yearly") => string;
        readonly confirmationMs: () => string;
        readonly confirmationTimeout: () => string;
    };
};
