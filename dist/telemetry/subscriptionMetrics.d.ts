export type SubscriptionOperation = 'create' | 'markCanceled' | 'markReactivated' | 'markEnded' | 'updatePeriodEnd';
export type ReconciliationOverwriteReason = 'status_mismatch' | 'period_end_stale' | 'cancel_state_mismatch' | 'downgrade' | 'dispute_detected';
export interface SubscriptionMetricsSummary {
    cancels: number;
    reactivates: number;
    auditWriteFailures: number;
    reconciliationOverwrites: number;
    period: {
        start: Date;
        end: Date;
    };
}
interface SubscriptionEventWrite {
    userId: string;
    eventType: 'cancel' | 'reactivate' | 'audit_write_failure' | 'reconciliation_overwrite';
    tier?: string;
    operation?: SubscriptionOperation;
    errorMessage?: string;
    reason?: ReconciliationOverwriteReason;
    fromState?: string | null;
    toState?: string | null;
}
interface SubscriptionMetricsStore {
    createEvent(write: SubscriptionEventWrite): Promise<void>;
    getEventCounts(startDate: Date, endDate: Date): Promise<Array<{
        eventType: string;
        count: number;
    }>>;
}
interface SubscriptionMetricsLogger {
    debug(message: string): void;
    error(message: string, error?: unknown): void;
}
export declare function createSubscriptionMetricsService(store: SubscriptionMetricsStore, logger: SubscriptionMetricsLogger): {
    logSubscriptionCancel: (userId: string, tier: string) => void;
    logSubscriptionReactivate: (userId: string, tier: string) => void;
    logSubscriptionAuditWriteFailure: (userId: string, operation: SubscriptionOperation, errorMessage: string) => void;
    logReconciliationOverwrite: (userId: string, reason: ReconciliationOverwriteReason, fromState: string | null, toState: string | null) => void;
    getSubscriptionMetrics: (startDate: Date, endDate: Date) => Promise<SubscriptionMetricsSummary>;
};
export {};
