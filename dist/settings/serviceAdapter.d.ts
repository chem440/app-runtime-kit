import type { SettingsTierBranding } from './tierBrandingCore';
export interface SettingsProfile {
    firstName: string;
    lastName: string;
}
/** A connected user profile (e.g. advisor, mentor, peer). */
export interface SettingsConnectionProfile {
    id: string;
    name: string | null;
    email: string;
}
/** A pending connection invite sent by or to the current user. */
export interface SettingsPendingConnectionInvite {
    id: string;
    inviteEmail: string;
    createdAt: string;
    status: string;
}
export interface SettingsPreferencesData {
    hideCompletedLessons: boolean;
    showPerformanceTimer: boolean;
    transparencyPreference: number;
    themePreference: string;
    /**
     * App-defined preference payload. The platform does not enforce schema here —
     * apps store domain-specific defaults (e.g. lesson defaults, feature flags)
     * under their own keys.
     */
    appDefaults?: Record<string, string | number | boolean | null>;
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
     * Apps populate this with their own cap metrics (e.g. `{ "voice_minutes": { used: 12, limit: 60 } }`).
     */
    usageByKey?: Record<string, SettingsUsageMetric>;
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
    invite?: SettingsPendingConnectionInvite;
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
/**
 * Platform-level settings service contract.
 *
 * Apps implement this interface to wire their own API endpoints into the
 * settings UI. All methods are async to support remote data sources.
 *
 * The connection/advisor methods model a generic user-to-user relationship:
 * one user can invite another, enable an advisor role, and manage the link.
 * Apps map these to their domain (mentor/mentee, coach/student, etc.).
 */
export interface SettingsServiceAdapter {
    /** Fetch the current user's preferences. */
    getPreferences: () => Promise<SettingsPreferencesData | null>;
    /** Fetch the current user's connection and any pending invite. */
    getConnectionState: () => Promise<SettingsConnectionState>;
    /** Enable the advisor/mentor role for the current user. */
    enableAdvisorMode: () => Promise<BecomeMentorResult>;
    /** Disable the advisor/mentor role for the current user. */
    disableAdvisorMode: () => Promise<BecomeMentorResult>;
    /** Send a connection invite to another user by email. */
    sendConnectionInvite: (inviteEmail: string) => Promise<InviteResult>;
    /** Cancel the current user's outgoing connection invite. */
    cancelConnectionInvite: () => Promise<ActionResult>;
    /** Remove the current user's active connection. */
    removeConnection: () => Promise<ActionResult>;
    /** Reset the current user's usage period (e.g. for testing). */
    clearUsagePeriod: () => Promise<ClearWeeklyCapResult>;
    getProfile: () => Promise<SettingsProfile | null>;
    saveProfile: (profile: SettingsProfile) => Promise<SaveProfileResult>;
    openBillingPortal: () => Promise<PortalResult>;
    cancelSubscription: () => Promise<CancelSubscriptionResult>;
    reactivateSubscription: () => Promise<ReactivateResult>;
    syncAccountInfo: (force: boolean) => Promise<SettingsSyncResult>;
    resolveTierBranding: (tierId?: string | null, tierName?: string | null) => SettingsTierBranding;
    getBillingUiPolicy: (accountInfo: SettingsAccountInfo) => SettingsBillingUiPolicy;
    refreshUserStatus: () => void;
    invalidateAccountInfo: () => void;
    invalidateSubscriptionWarning: () => void;
}
/** No-op adapter used as a safe default before the real adapter is wired up. */
export declare const unconfiguredSettingsServiceAdapter: SettingsServiceAdapter;
