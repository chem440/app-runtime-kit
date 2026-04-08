import type { SettingsTierBranding } from './tierBrandingCore'
import { resolveSettingsTierBranding } from './tierBrandingCore'

export interface SettingsProfile {
    firstName: string
    lastName: string
}

export interface SettingsConnectionProfile {
    id: string
    name: string | null
    email: string
}

export interface SettingsPendingConnectionInvite {
    id: string
    inviteEmail: string
    /**
     * @deprecated App-specific alias kept for compatibility.
     */
    mentorEmail?: string
    createdAt: string
    status: string
}

// Backward-compatible aliases for app-specific naming.
export type SettingsMentor = SettingsConnectionProfile
export type SettingsPendingInvite = SettingsPendingConnectionInvite

export interface SettingsPreferencesData {
    hideCompletedLessons: boolean
    showPerformanceTimer: boolean
    transparencyPreference: number
    themePreference: string
    /**
     * App-defined preference payload. Platform does not enforce schema here.
     */
    appDefaults?: Record<string, string | number | boolean | null>
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultGrade?: string | null
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultSubject?: string | null
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultUnit?: string | null
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultLocation?: string | null
}

export interface SettingsUsageMetric {
    used: number
    limit: number
}

export interface SettingsAccountInfo {
    tier: string
    tierName: string
    isPaid: boolean
    isPartner: boolean
    status: string | null
    billingInterval: string | null
    periodEndsAt: string | null
    cancelAt: string | null
    paymentFailedAt: string | null
    hasCustomer: boolean
    hasSubscription: boolean
    /**
     * Generic usage map keyed by app-defined capability IDs.
     */
    usageByKey?: Record<string, SettingsUsageMetric>
    /**
     * @deprecated App-specific usage shape; kept for compatibility.
     */
    usage?: {
        voiceSessions: SettingsUsageMetric
        voiceMinutes: SettingsUsageMetric
        lessonAnalyses: SettingsUsageMetric
    }
    weekResetsAt?: string
}

export interface SettingsSyncResult {
    data: SettingsAccountInfo
    synced: boolean
    rateLimited?: boolean
    retryAfterSeconds?: number
}

export interface BecomeMentorResult {
    success: boolean
    message?: string
    error?: string
}

export interface SaveProfileResult {
    success: boolean
    data?: SettingsProfile
    error?: string
}

export interface InviteResult {
    ok: boolean
    invite?: SettingsPendingInvite
    error?: string
}

export interface ActionResult {
    ok: boolean
    error?: string
}

export interface PortalResult {
    url?: string
    error?: string
}

export interface ReactivateResult {
    success: boolean
    nextBillingDate?: string
    error?: string
}

export interface ClearWeeklyCapResult {
    success: boolean
    message?: string
    error?: string
}

export interface CancelSubscriptionResult {
    success: boolean
    error?: string
}

export interface SettingsBillingUiPolicy {
    hideSubscriptionWarnings: boolean
    canReactivate: boolean
    showViewPlansButton: boolean
    showLegacySubscriptionWarning: boolean
    showEnterpriseMessage: boolean
}

export interface SettingsConnectionState {
    connection: SettingsConnectionProfile | null
    pendingInvite: SettingsPendingConnectionInvite | null
}

export interface SettingsServiceAdapter {
    getPreferences: () => Promise<SettingsPreferencesData | null>
    getConnectionState: () => Promise<SettingsConnectionState>
    enableAdvisorMode: () => Promise<BecomeMentorResult>
    disableAdvisorMode: () => Promise<BecomeMentorResult>
    sendConnectionInvite: (inviteEmail: string) => Promise<InviteResult>
    cancelConnectionInvite: () => Promise<ActionResult>
    removeConnection: () => Promise<ActionResult>
    clearUsagePeriod: () => Promise<ClearWeeklyCapResult>

    // Legacy app-specific API retained during migration.
    getMenteeMentorState: () => Promise<{
        mentor: SettingsMentor | null
        pendingInvite: SettingsPendingInvite | null
    }>
    getProfile: () => Promise<SettingsProfile | null>
    saveProfile: (profile: SettingsProfile) => Promise<SaveProfileResult>
    becomeMentor: () => Promise<BecomeMentorResult>
    deactivateMentor: () => Promise<BecomeMentorResult>
    sendInvite: (mentorEmail: string) => Promise<InviteResult>
    cancelInvite: () => Promise<ActionResult>
    removeMentor: () => Promise<ActionResult>
    openBillingPortal: () => Promise<PortalResult>
    cancelSubscription: () => Promise<CancelSubscriptionResult>
    reactivateSubscription: () => Promise<ReactivateResult>
    clearWeeklyCap: () => Promise<ClearWeeklyCapResult>
    syncAccountInfo: (force: boolean) => Promise<SettingsSyncResult>
    resolveTierBranding: (tierId?: string | null, tierName?: string | null) => SettingsTierBranding
    getBillingUiPolicy: (accountInfo: SettingsAccountInfo) => SettingsBillingUiPolicy
    refreshUserStatus: () => void
    invalidateAccountInfo: () => void
    invalidateSubscriptionWarning: () => void
}

const UNCONFIGURED_ERROR = 'Settings service adapter is not configured'

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
    hasSubscription: false
}

export const unconfiguredSettingsServiceAdapter: SettingsServiceAdapter = {
    async getPreferences() {
        return null
    },
    async getConnectionState() {
        return { connection: null, pendingInvite: null }
    },
    async enableAdvisorMode() {
        return { success: false, error: UNCONFIGURED_ERROR }
    },
    async disableAdvisorMode() {
        return { success: false, error: UNCONFIGURED_ERROR }
    },
    async sendConnectionInvite() {
        return { ok: false, error: UNCONFIGURED_ERROR }
    },
    async cancelConnectionInvite() {
        return { ok: false, error: UNCONFIGURED_ERROR }
    },
    async removeConnection() {
        return { ok: false, error: UNCONFIGURED_ERROR }
    },
    async clearUsagePeriod() {
        return { success: false, error: UNCONFIGURED_ERROR }
    },
    async getMenteeMentorState() {
        return { mentor: null, pendingInvite: null }
    },
    async getProfile() {
        return null
    },
    async saveProfile() {
        return { success: false, error: UNCONFIGURED_ERROR }
    },
    async becomeMentor() {
        return unconfiguredSettingsServiceAdapter.enableAdvisorMode()
    },
    async deactivateMentor() {
        return unconfiguredSettingsServiceAdapter.disableAdvisorMode()
    },
    async sendInvite() {
        return unconfiguredSettingsServiceAdapter.sendConnectionInvite('')
    },
    async cancelInvite() {
        return unconfiguredSettingsServiceAdapter.cancelConnectionInvite()
    },
    async removeMentor() {
        return unconfiguredSettingsServiceAdapter.removeConnection()
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
    async clearWeeklyCap() {
        return unconfiguredSettingsServiceAdapter.clearUsagePeriod()
    },
    async syncAccountInfo() {
        return { data: EMPTY_ACCOUNT_INFO, synced: false }
    },
    resolveTierBranding(tierId, tierName) {
        return resolveSettingsTierBranding({ tierId, tierName })
    },
    getBillingUiPolicy() {
        return {
            hideSubscriptionWarnings: false,
            canReactivate: true,
            showViewPlansButton: true,
            showLegacySubscriptionWarning: false,
            showEnterpriseMessage: false
        }
    },
    refreshUserStatus() {},
    invalidateAccountInfo() {},
    invalidateSubscriptionWarning() {}
}
