export function createSubscriptionMetricsService(store, logger) {
    function logSubscriptionCancel(userId, tier) {
        store.createEvent({
            userId,
            eventType: 'cancel',
            tier,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] ${userId}: cancel (${tier})`);
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log cancel:', error);
        });
    }
    function logSubscriptionReactivate(userId, tier) {
        store.createEvent({
            userId,
            eventType: 'reactivate',
            tier,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] ${userId}: reactivate (${tier})`);
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log reactivate:', error);
        });
    }
    function logSubscriptionAuditWriteFailure(userId, operation, errorMessage) {
        store.createEvent({
            userId,
            eventType: 'audit_write_failure',
            operation,
            errorMessage,
        }).then(() => {
            logger.error(`[SubscriptionMetrics] AUDIT_WRITE_FAILURE ${userId}: ${operation} - ${errorMessage}`);
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log audit write failure:', error);
        });
    }
    function logReconciliationOverwrite(userId, reason, fromState, toState) {
        store.createEvent({
            userId,
            eventType: 'reconciliation_overwrite',
            reason,
            fromState,
            toState,
        }).then(() => {
            logger.debug(`[SubscriptionMetrics] RECONCILIATION_OVERWRITE ${userId}: ${reason} (${fromState} -> ${toState})`);
        }).catch((error) => {
            logger.error('[SubscriptionMetrics] Failed to log reconciliation overwrite:', error);
        });
    }
    async function getSubscriptionMetrics(startDate, endDate) {
        const events = await store.getEventCounts(startDate, endDate);
        const counts = {};
        for (const event of events) {
            counts[event.eventType] = event.count;
        }
        return {
            cancels: counts.cancel ?? 0,
            reactivates: counts.reactivate ?? 0,
            auditWriteFailures: counts.audit_write_failure ?? 0,
            reconciliationOverwrites: counts.reconciliation_overwrite ?? 0,
            period: { start: startDate, end: endDate },
        };
    }
    return {
        logSubscriptionCancel,
        logSubscriptionReactivate,
        logSubscriptionAuditWriteFailure,
        logReconciliationOverwrite,
        getSubscriptionMetrics,
    };
}
