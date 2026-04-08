export type TierChangeReason = 'signup' | 'upgrade' | 'downgrade' | 'churn' | 'reactivation' | 'reconciliation' | 'dispute' | 'admin_sync' | 'migration';
export declare function determineTierChangeReason(fromTier: string | null, toTier: string, isReactivation?: boolean): TierChangeReason;
