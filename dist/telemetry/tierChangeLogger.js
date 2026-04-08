import { determineTierChangeReason, } from './tierChange';
export { determineTierChangeReason };
export function createTierChangeLoggerService(store, logger) {
    async function persistTierChange(params) {
        const { userId, fromTier, toTier, reason, stripeEventId } = params;
        if (stripeEventId) {
            const exists = await store.findByStripeEventId(stripeEventId);
            if (exists) {
                logger.debug(`[TierChangeLogger] Duplicate event ${stripeEventId}, skipping`);
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
