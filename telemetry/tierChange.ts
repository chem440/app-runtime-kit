export type TierChangeReason =
    | 'signup'
    | 'upgrade'
    | 'downgrade'
    | 'churn'
    | 'reactivation'
    | 'reconciliation'
    | 'dispute'
    | 'admin_sync'
    | 'migration'

export function determineTierChangeReason(
    fromTier: string | null,
    toTier: string,
    isReactivation = false
): TierChangeReason {
    if (isReactivation) return 'reactivation'
    if (!fromTier) return 'signup'

    const tierRanks: Record<string, number> = {
        PARTNER: 0,
        LIGHT: 0,
        PRO: 1,
        PREMIUM: 2,
        ENTERPRISE: 3,
    }

    const fromRank = tierRanks[fromTier.toUpperCase()] ?? 0
    const toRank = tierRanks[toTier.toUpperCase()] ?? 0

    if (toTier.toUpperCase() === 'LIGHT' && fromRank > 0) return 'churn'
    if (toRank > fromRank) return 'upgrade'
    if (toRank < fromRank) return 'downgrade'

    return 'signup'
}
