import type { ActionResult, BecomeMentorResult, ClearWeeklyCapResult, InviteResult, SaveProfileResult, SettingsConnectionState, SettingsPreferencesData, SettingsProfile, SettingsServiceAdapter } from '../settings/serviceAdapter';
export interface SettingsService {
    getPreferences: () => Promise<SettingsPreferencesData | null>;
    getConnectionState: () => Promise<SettingsConnectionState>;
    saveProfile: (profile: SettingsProfile) => Promise<SaveProfileResult>;
    enableAdvisorMode: () => Promise<BecomeMentorResult>;
    disableAdvisorMode: () => Promise<BecomeMentorResult>;
    sendConnectionInvite: (inviteEmail: string) => Promise<InviteResult>;
    cancelConnectionInvite: () => Promise<ActionResult>;
    removeConnection: () => Promise<ActionResult>;
    clearUsagePeriod: () => Promise<ClearWeeklyCapResult>;
}
export declare function createSettingsServiceFromAdapter(adapter: SettingsServiceAdapter): SettingsService;
export declare const unconfiguredSettingsService: SettingsService;
