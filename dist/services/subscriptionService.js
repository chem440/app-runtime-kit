const UNCONFIGURED_ERROR = 'Subscription service is not configured';
const EMPTY_ACCOUNT_INFO = {
    tier: 'unknown',
    tierName: 'Unknown',
    isPaid: false,
    isPartner: false,
    status: null,
    billingInterval: null,
    periodEndsAt: null,
    cancelAt: null,
    paymentFailedAt: null,
    hasCustomer: false,
    hasSubscription: false,
};
export function createSubscriptionServiceFromAdapter(adapter) {
    return {
        getAccountInfo: async () => {
            const result = await adapter.syncAccountInfo(false);
            return result.data;
        },
        syncAccountInfo: adapter.syncAccountInfo,
        openBillingPortal: adapter.openBillingPortal,
        cancelSubscription: adapter.cancelSubscription,
        reactivateSubscription: adapter.reactivateSubscription,
        getBillingUiPolicy: adapter.getBillingUiPolicy,
        refreshUserStatus: adapter.refreshUserStatus,
        invalidateAccountInfo: adapter.invalidateAccountInfo,
        invalidateSubscriptionWarning: adapter.invalidateSubscriptionWarning,
    };
}
export const unconfiguredSubscriptionService = {
    async getAccountInfo() {
        return EMPTY_ACCOUNT_INFO;
    },
    async syncAccountInfo() {
        return {
            data: EMPTY_ACCOUNT_INFO,
            synced: false,
            rateLimited: false,
        };
    },
    async openBillingPortal() {
        return { error: UNCONFIGURED_ERROR };
    },
    async cancelSubscription() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    async reactivateSubscription() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    getBillingUiPolicy() {
        return {
            hideSubscriptionWarnings: false,
            canReactivate: false,
            showViewPlansButton: true,
            showLegacySubscriptionWarning: false,
            showEnterpriseMessage: false,
        };
    },
    refreshUserStatus() { },
    invalidateAccountInfo() { },
    invalidateSubscriptionWarning() { },
};
