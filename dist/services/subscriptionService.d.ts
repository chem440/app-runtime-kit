import type { CancelSubscriptionResult, ReactivateResult, SettingsAccountInfo, SettingsBillingUiPolicy, SettingsServiceAdapter, SettingsSyncResult } from '../settings/serviceAdapter';
export interface BillingPortalResult {
    url?: string;
    error?: string;
}
export interface SubscriptionService {
    getAccountInfo: () => Promise<SettingsAccountInfo>;
    syncAccountInfo: (force: boolean) => Promise<SettingsSyncResult>;
    openBillingPortal: () => Promise<BillingPortalResult>;
    cancelSubscription: () => Promise<CancelSubscriptionResult>;
    reactivateSubscription: () => Promise<ReactivateResult>;
    getBillingUiPolicy: (accountInfo: SettingsAccountInfo) => SettingsBillingUiPolicy;
    refreshUserStatus: () => void;
    invalidateAccountInfo: () => void;
    invalidateSubscriptionWarning: () => void;
}
export declare function createSubscriptionServiceFromAdapter(adapter: SettingsServiceAdapter): SubscriptionService;
export declare const unconfiguredSubscriptionService: SubscriptionService;
