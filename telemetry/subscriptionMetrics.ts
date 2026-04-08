export type SubscriptionOperation =
    | 'create'
    | 'markCanceled'
    | 'markReactivated'
    | 'markEnded'
    | 'updatePeriodEnd'

export type ReconciliationOverwriteReason =
    | 'status_mismatch'
    | 'period_end_stale'
    | 'cancel_state_mismatch'
    | 'downgrade'
    | 'dispute_detected'

export interface SubscriptionMetricsSummary {
    cancels: number
    reactivates: number
    auditWriteFailures: number
    reconciliationOverwrites: number
    period: { start: Date; end: Date }
}

interface SubscriptionEventWrite {
    userId: string
    eventType: 'cancel' | 'reactivate' | 'audit_write_failure' | 'reconciliation_overwrite'
    tier?: string
    operation?: SubscriptionOperation
    errorMessage?: string
    reason?: ReconciliationOverwriteReason
    fromState?: string | null
    toState?: string | null
}

interface SubscriptionMetricsStore {
    createEvent(write: SubscriptionEventWrite): Promise<void>
    getEventCounts(startDate: Date, endDate: Date): Promise<Array<{ eventType: string; count: number }>>
}

interface SubscriptionMetricsLogger {
    debug(message: string): void
    error(message: string, error?: unknown): void
}

export function createSubscriptionMetricsService(
    store: SubscriptionMetricsStore,
    logger: SubscriptionMetricsLogger
) {
    function logSubscriptionCancel(userId: string, tier: string): void {
        store.createEvent({
            userId,
            eventType: 'cancel',
            tier,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] ${userId}: cancel (${tier})`)
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log cancel:', error)
        })
    }

    function logSubscriptionReactivate(userId: string, tier: string): void {
        store.createEvent({
            userId,
            eventType: 'reactivate',
            tier,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] ${userId}: reactivate (${tier})`)
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log reactivate:', error)
        })
    }

    function logSubscriptionAuditWriteFailure(
        userId: string,
        operation: SubscriptionOperation,
        errorMessage: string
    ): void {
        store.createEvent({
            userId,
            eventType: 'audit_write_failure',
            operation,
            errorMessage,
        }).then(() => {
            logger.error(`[SubscriptionMetrics] AUDIT_WRITE_FAILURE ${userId}: ${operation} - ${errorMessage}`)
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log audit write failure:', error)
        })
    }

    function logReconciliationOverwrite(
        userId: string,
        reason: ReconciliationOverwriteReason,
        fromState: string | null,
        toState: string | null
    ): void {
        store.createEvent({
            userId,
            eventType: 'reconciliation_overwrite',
            reason,
            fromState,
            toState,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] RECONCILIATION_OVERWRITE ${userId}: ${reason} (${fromState} -> ${toState})`)
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log reconciliation overwrite:', error)
        })
    }

    async function getSubscriptionMetrics(
        startDate: Date,
        endDate: Date
    ): Promise<SubscriptionMetricsSummary> {
        const events = await store.getEventCounts(startDate, endDate)
        const counts: Record<string, number> = {}
        for (const event of events) {
            counts[event.eventType] = event.count
        }
        return {
            cancels: counts.cancel ?? 0,
            reactivates: counts.reactivate ?? 0,
            auditWriteFailures: counts.audit_write_failure ?? 0,
            reconciliationOverwrites: counts.reconciliation_overwrite ?? 0,
            period: { start: startDate, end: endDate },
        }
    }

    return {
        logSubscriptionCancel,
        logSubscriptionReactivate,
        logSubscriptionAuditWriteFailure,
        logReconciliationOverwrite,
        getSubscriptionMetrics,
    }
}
