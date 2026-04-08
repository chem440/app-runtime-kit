export function determineTierChangeReason(fromTier, toTier, isReactivation = false) {
    if (isReactivation)
        return 'reactivation';
    if (!fromTier)
        return 'signup';
    const tierRanks = {
        PARTNER: 0,
        LIGHT: 0,
        PRO: 1,
        PREMIUM: 2,
        ENTERPRISE: 3,
    };
    const fromRank = tierRanks[fromTier.toUpperCase()] ?? 0;
    const toRank = tierRanks[toTier.toUpperCase()] ?? 0;
    if (toTier.toUpperCase() === 'LIGHT' && fromRank > 0)
        return 'churn';
    if (toRank > fromRank)
        return 'upgrade';
    if (toRank < fromRank)
        return 'downgrade';
    return 'signup';
}
