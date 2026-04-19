import { resolveSettingsTierBranding } from './tierBrandingCore.js';
const UNCONFIGURED_ERROR = 'Settings service adapter is not configured';
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
    hasSubscription: false
};
/** No-op adapter used as a safe default before the real adapter is wired up. */
export const unconfiguredSettingsServiceAdapter = {
    async getPreferences() { return null; },
    async getConnectionState() { return { connection: null, pendingInvite: null }; },
    async enableAdvisorMode() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async disableAdvisorMode() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async sendConnectionInvite() { return { ok: false, error: UNCONFIGURED_ERROR }; },
    async cancelConnectionInvite() { return { ok: false, error: UNCONFIGURED_ERROR }; },
    async removeConnection() { return { ok: false, error: UNCONFIGURED_ERROR }; },
    async clearUsagePeriod() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async getProfile() { return null; },
    async saveProfile() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async openBillingPortal() { return { error: UNCONFIGURED_ERROR }; },
    async cancelSubscription() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async reactivateSubscription() { return { success: false, error: UNCONFIGURED_ERROR }; },
    async syncAccountInfo() { return { data: EMPTY_ACCOUNT_INFO, synced: false }; },
    resolveTierBranding(tierId, tierName) { return resolveSettingsTierBranding({ tierId, tierName }); },
    getBillingUiPolicy() {
        return {
            hideSubscriptionWarnings: false,
            canReactivate: true,
            showViewPlansButton: true,
            showLegacySubscriptionWarning: false,
            showEnterpriseMessage: false
        };
    },
    refreshUserStatus() { },
    invalidateAccountInfo() { },
    invalidateSubscriptionWarning() { }
};
