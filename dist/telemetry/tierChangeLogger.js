import { determineTierChangeReason, } from './tierChange.js';
export { determineTierChangeReason };
export function createTierChangeLoggerService(store, logger) {
    async function persistTierChange(params) {
        const { userId, fromTier, toTier, reason, billingEventId } = params;
        if (billingEventId) {
            const exists = await store.findByBillingEventId(billingEventId);
            if (exists) {
                logger.debug(`[TierChangeLogger] Duplicate event ${billingEventId}, skipping`);
                return;
            }
        }
        await store.create(params);
        logger.debug(`[TierChangeLogger] ${userId}: ${fromTier ?? 'null'} -> ${toTier} (${reason})`);
    }
    function logTierChange(params) {
        persistTierChange(params).catch(error => {
            logger.error('[TierChangeLogger] Failed to log tier change:', error);
        });
    }
    async function logTierChangeAsync(params) {
        await persistTierChange(params);
    }
    return {
        logTierChange,
        logTierChangeAsync,
        determineTierChangeReason,
    };
}
