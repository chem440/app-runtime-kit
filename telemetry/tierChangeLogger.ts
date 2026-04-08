import {
    determineTierChangeReason,
    type TierChangeReason,
} from './tierChange'
export { determineTierChangeReason }
export type { TierChangeReason }

export interface TierChangeParams {
    userId: string
    fromTier: string | null
    toTier: string
    reason: TierChangeReason
    stripeEventId?: string
}

interface TierChangeStore {
    findByStripeEventId(stripeEventId: string): Promise<boolean>
    create(params: TierChangeParams): Promise<void>
}

interface TierChangeLogger {
    debug(message: string): void
    error(message: string, error?: unknown): void
}

export function createTierChangeLoggerService(
    store: TierChangeStore,
    logger: TierChangeLogger
) {
    async function persistTierChange(params: TierChangeParams): Promise<void> {
        const { userId, fromTier, toTier, reason, stripeEventId } = params

        if (stripeEventId) {
            const exists = await store.findByStripeEventId(stripeEventId)
            if (exists) {
                logger.debug(`[TierChangeLogger] Duplicate event ${stripeEventId}, skipping`)
                return
            }
        }

        await store.create(params)
        logger.debug(`[TierChangeLogger] ${userId}: ${fromTier ?? 'null'} -> ${toTier} (${reason})`)
    }

    function logTierChange(params: TierChangeParams): void {
        persistTierChange(params).catch(error => {
            logger.error('[TierChangeLogger] Failed to log tier change:', error)
        })
    }

    async function logTierChangeAsync(params: TierChangeParams): Promise<void> {
        await persistTierChange(params)
    }

    return {
        logTierChange,
        logTierChangeAsync,
        determineTierChangeReason,
    }
}
