export type TierChangeReason = 'signup' | 'upgrade' | 'downgrade' | 'churn' | 'reactivation' | 'reconciliation' | 'dispute' | 'admin_sync' | 'migration';
/**
 * Determine the business reason for a tier change.
 *
 * @param fromTier - The user's previous tier ID (null if this is a new account).
 * @param toTier - The user's new tier ID.
 * @param isReactivation - Pass true when a cancelled subscription is being reactivated.
 * @param tierRanks - Map of upper-cased tier ID to numeric rank. Higher rank = higher tier.
 *   Tiers not in the map default to rank 0 (free/base tier). Apps pass their own rank
 *   map so the kit stays free of hardcoded product tier names.
 * @param freeBaseTierId - Upper-cased tier ID that represents the free/base tier (rank 0).
 *   Downgrading to this tier is classified as churn instead of a regular downgrade.
 *   Defaults to `'LIGHT'` for backwards compatibility; supply your app's free tier name.
 */
export declare function determineTierChangeReason(fromTier: string | null, toTier: string, isReactivation?: boolean, tierRanks?: Record<string, number>, freeBaseTierId?: string): TierChangeReason;
