import type {
  CancelSubscriptionResult,
  ReactivateResult,
  SettingsAccountInfo,
  SettingsBillingUiPolicy,
  SettingsServiceAdapter,
  SettingsSyncResult,
} from '../settings/serviceAdapter'

const UNCONFIGURED_ERROR = 'Subscription service is not configured'

const EMPTY_ACCOUNT_INFO: SettingsAccountInfo = {
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
}

export interface BillingPortalResult {
  url?: string
  error?: string
}

export interface SubscriptionService {
  getAccountInfo: () => Promise<SettingsAccountInfo>
  syncAccountInfo: (force: boolean) => Promise<SettingsSyncResult>
  openBillingPortal: () => Promise<BillingPortalResult>
  cancelSubscription: () => Promise<CancelSubscriptionResult>
  reactivateSubscription: () => Promise<ReactivateResult>
  getBillingUiPolicy: (accountInfo: SettingsAccountInfo) => SettingsBillingUiPolicy
  refreshUserStatus: () => void
  invalidateAccountInfo: () => void
  invalidateSubscriptionWarning: () => void
}

export function createSubscriptionServiceFromAdapter(
  adapter: SettingsServiceAdapter
): SubscriptionService {
  return {
    getAccountInfo: async () => {
      const result = await adapter.syncAccountInfo(false)
      return result.data
    },
    syncAccountInfo: adapter.syncAccountInfo,
    openBillingPortal: adapter.openBillingPortal,
    cancelSubscription: adapter.cancelSubscription,
    reactivateSubscription: adapter.reactivateSubscription,
    getBillingUiPolicy: adapter.getBillingUiPolicy,
    refreshUserStatus: adapter.refreshUserStatus,
    invalidateAccountInfo: adapter.invalidateAccountInfo,
    invalidateSubscriptionWarning: adapter.invalidateSubscriptionWarning,
  }
}

export const unconfiguredSubscriptionService: SubscriptionService = {
  async getAccountInfo() {
    return EMPTY_ACCOUNT_INFO
  },
  async syncAccountInfo() {
    return {
      data: EMPTY_ACCOUNT_INFO,
      synced: false,
      rateLimited: false,
    }
  },
  async openBillingPortal() {
    return { error: UNCONFIGURED_ERROR }
  },
  async cancelSubscription() {
    return { success: false, error: UNCONFIGURED_ERROR }
  },
  async reactivateSubscription() {
    return { success: false, error: UNCONFIGURED_ERROR }
  },
  getBillingUiPolicy() {
    return {
      hideSubscriptionWarnings: false,
      canReactivate: false,
      showViewPlansButton: true,
      showLegacySubscriptionWarning: false,
      showEnterpriseMessage: false,
    }
  },
  refreshUserStatus() {},
  invalidateAccountInfo() {},
  invalidateSubscriptionWarning() {},
}
