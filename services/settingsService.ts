import type {
  ActionResult,
  BecomeMentorResult,
  ClearWeeklyCapResult,
  InviteResult,
  SaveProfileResult,
  SettingsConnectionState,
  SettingsPreferencesData,
  SettingsProfile,
  SettingsServiceAdapter,
} from '../settings/serviceAdapter'

const UNCONFIGURED_ERROR = 'Settings service is not configured'

export interface SettingsService {
  getPreferences: () => Promise<SettingsPreferencesData | null>
  getConnectionState: () => Promise<SettingsConnectionState>
  saveProfile: (profile: SettingsProfile) => Promise<SaveProfileResult>
  enableAdvisorMode: () => Promise<BecomeMentorResult>
  disableAdvisorMode: () => Promise<BecomeMentorResult>
  sendConnectionInvite: (inviteEmail: string) => Promise<InviteResult>
  cancelConnectionInvite: () => Promise<ActionResult>
  removeConnection: () => Promise<ActionResult>
  clearUsagePeriod: () => Promise<ClearWeeklyCapResult>
}

export function createSettingsServiceFromAdapter(
  adapter: SettingsServiceAdapter
): SettingsService {
  return {
    getPreferences: adapter.getPreferences,
    getConnectionState: adapter.getConnectionState,
    saveProfile: adapter.saveProfile,
    enableAdvisorMode: adapter.enableAdvisorMode,
    disableAdvisorMode: adapter.disableAdvisorMode,
    sendConnectionInvite: adapter.sendConnectionInvite,
    cancelConnectionInvite: adapter.cancelConnectionInvite,
    removeConnection: adapter.removeConnection,
    clearUsagePeriod: adapter.clearUsagePeriod,
  }
}

export const unconfiguredSettingsService: SettingsService = {
  async getPreferences() {
    return null
  },
  async getConnectionState() {
    return { connection: null, pendingInvite: null }
  },
  async saveProfile() {
    return { success: false, error: UNCONFIGURED_ERROR }
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
}
