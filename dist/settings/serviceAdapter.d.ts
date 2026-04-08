import type { SettingsTierBranding } from './tierBrandingCore';
export interface SettingsProfile {
    firstName: string;
    lastName: string;
}
export interface SettingsConnectionProfile {
    id: string;
    name: string | null;
    email: string;
}
export interface SettingsPendingConnectionInvite {
    id: string;
    inviteEmail: string;
    /**
     * @deprecated App-specific alias kept for compatibility.
     */
    mentorEmail?: string;
    createdAt: string;
    status: string;
}
export type SettingsMentor = SettingsConnectionProfile;
export type SettingsPendingInvite = SettingsPendingConnectionInvite;
export interface SettingsPreferencesData {
    hideCompletedLessons: boolean;
    showPerformanceTimer: boolean;
    transparencyPreference: number;
    themePreference: string;
    /**
     * App-defined preference payload. Platform does not enforce schema here.
     */
    appDefaults?: Record<string, string | number | boolean | null>;
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultGrade?: string | null;
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultSubject?: string | null;
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultUnit?: string | null;
    /**
     * @deprecated App-specific; kept for compatibility during migration.
     */
    lessonDefaultLocation?: string | null;
}
export interface SettingsUsageMetric {
    used: number;
    limit: number;
}
export interface SettingsAccountInfo {
    tier: string;
    tierName: string;
    isPaid: boolean;
    isPartner: boolean;
    status: string | null;
    billingInterval: string | null;
    periodEndsAt: string | null;
    cancelAt: string | null;
    paymentFailedAt: string | null;
    hasCustomer: boolean;
    hasSubscription: boolean;
    /**
     * Generic usage map keyed by app-defined capability IDs.
     */
    usageByKey?: Record<string, SettingsUsageMetric>;
    /**
     * @deprecated App-specific usage shape; kept for compatibility.
     */
    usage?: {
        voiceSessions: SettingsUsageMetric;
        voiceMinutes: SettingsUsageMetric;
        lessonAnalyses: SettingsUsageMetric;
    };
    weekResetsAt?: string;
}
export interface SettingsSyncResult {
    data: SettingsAccountInfo;
    synced: boolean;
    rateLimited?: boolean;
    retryAfterSeconds?: number;
}
export interface BecomeMentorResult {
    success: boolean;
    message?: string;
    error?: string;
}
export interface SaveProfileResult {
    success: boolean;
    data?: SettingsProfile;
    error?: string;
}
export interface InviteResult {
    ok: boolean;
    invite?: SettingsPendingInvite;
    error?: string;
}
export interface ActionResult {
    ok: boolean;
    error?: string;
}
export interface PortalResult {
    url?: string;
    error?: string;
}
export interface ReactivateResult {
    success: boolean;
    nextBillingDate?: string;
    error?: string;
}
export interface ClearWeeklyCapResult {
    success: boolean;
    message?: string;
    error?: string;
}
export interface CancelSubscriptionResult {
    success: boolean;
    error?: string;
}
export interface SettingsBillingUiPolicy {
    hideSubscriptionWarnings: boolean;
    canReactivate: boolean;
    showViewPlansButton: boolean;
    showLegacySubscriptionWarning: boolean;
    showEnterpriseMessage: boolean;
}
export interface SettingsConnectionState {
    connection: SettingsConnectionProfile | null;
    pendingInvite: SettingsPendingConnectionInvite | null;
}
export interface SettingsServiceAdapter {
    getPreferences: () => Promise<SettingsPreferencesData | null>;
    getConnectionState: () => Promise<SettingsConnectionState>;
    enableAdvisorMode: () => Promise<BecomeMentorResult>;
    disableAdvisorMode: () => Promise<BecomeMentorResult>;
    sendConnectionInvite: (inviteEmail: string) => Promise<InviteResult>;
    cancelConnectionInvite: () => Promise<ActionResult>;
    removeConnection: () => Promise<ActionResult>;
    clearUsagePeriod: () => Promise<ClearWeeklyCapResult>;
    getMenteeMentorState: () => Promise<{
        mentor: SettingsMentor | null;
        pendingInvite: SettingsPendingInvite | null;
    }>;
    getProfile: () => Promise<SettingsProfile | null>;
    saveProfile: (profile: SettingsProfile) => Promise<SaveProfileResult>;
    becomeMentor: () => Promise<BecomeMentorResult>;
    deactivateMentor: () => Promise<BecomeMentorResult>;
    sendInvite: (mentorEmail: string) => Promise<InviteResult>;
    cancelInvite: () => Promise<ActionResult>;
    removeMentor: () => Promise<ActionResult>;
    openBillingPortal: () => Promise<PortalResult>;
    cancelSubscription: () => Promise<CancelSubscriptionResult>;
    reactivateSubscription: () => Promise<ReactivateResult>;
    clearWeeklyCap: () => Promise<ClearWeeklyCapResult>;
    syncAccountInfo: (force: boolean) => Promise<SettingsSyncResult>;
    resolveTierBranding: (tierId?: string | null, tierName?: string | null) => SettingsTierBranding;
    getBillingUiPolicy: (accountInfo: SettingsAccountInfo) => SettingsBillingUiPolicy;
    refreshUserStatus: () => void;
    invalidateAccountInfo: () => void;
    invalidateSubscriptionWarning: () => void;
}
export declare const unconfiguredSettingsServiceAdapter: SettingsServiceAdapter;
