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
export const unconfiguredSettingsServiceAdapter = {
    async getPreferences() {
        return null;
    },
    async getConnectionState() {
        return { connection: null, pendingInvite: null };
    },
    async enableAdvisorMode() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    async disableAdvisorMode() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    async sendConnectionInvite() {
        return { ok: false, error: UNCONFIGURED_ERROR };
    },
    async cancelConnectionInvite() {
        return { ok: false, error: UNCONFIGURED_ERROR };
    },
    async removeConnection() {
        return { ok: false, error: UNCONFIGURED_ERROR };
    },
    async clearUsagePeriod() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    async getMenteeMentorState() {
        return { mentor: null, pendingInvite: null };
    },
    async getProfile() {
        return null;
    },
    async saveProfile() {
        return { success: false, error: UNCONFIGURED_ERROR };
    },
    async becomeMentor() {
        return unconfiguredSettingsServiceAdapter.enableAdvisorMode();
    },
    async deactivateMentor() {
        return unconfiguredSettingsServiceAdapter.disableAdvisorMode();
    },
    async sendInvite() {
        return unconfiguredSettingsServiceAdapter.sendConnectionInvite('');
    },
    async cancelInvite() {
        return unconfiguredSettingsServiceAdapter.cancelConnectionInvite();
    },
    async removeMentor() {
        return unconfiguredSettingsServiceAdapter.removeConnection();
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
    async clearWeeklyCap() {
        return unconfiguredSettingsServiceAdapter.clearUsagePeriod();
    },
    async syncAccountInfo() {
        return { data: EMPTY_ACCOUNT_INFO, synced: false };
    },
    resolveTierBranding(tierId, tierName) {
        return resolveSettingsTierBranding({ tierId, tierName });
    },
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
