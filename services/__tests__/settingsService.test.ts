import { describe, expect, it, vi } from 'vitest'
import {
  type SettingsServiceAdapter,
  unconfiguredSettingsServiceAdapter,
} from '../../settings/serviceAdapter'
import {
  createSettingsServiceFromAdapter,
  unconfiguredSettingsService,
} from '../settingsService'

describe('settingsService', () => {
  it('maps adapter calls into service contract', async () => {
    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      getPreferences: vi.fn(async () => ({
        hideCompletedLessons: false,
        showPerformanceTimer: true,
        transparencyPreference: 0,
        themePreference: 'system',
      })),
      getConnectionState: vi.fn(async () => ({ connection: null, pendingInvite: null })),
      saveProfile: vi.fn(async () => ({ success: true })),
      enableAdvisorMode: vi.fn(async () => ({ success: true })),
      disableAdvisorMode: vi.fn(async () => ({ success: true })),
      sendConnectionInvite: vi.fn(async () => ({ ok: true })),
      cancelConnectionInvite: vi.fn(async () => ({ ok: true })),
      removeConnection: vi.fn(async () => ({ ok: true })),
      clearUsagePeriod: vi.fn(async () => ({ success: true })),
    }

    const service = createSettingsServiceFromAdapter(adapter)

    await service.getPreferences()
    await service.getConnectionState()
    await service.saveProfile({ firstName: 'B', lastName: 'Teacher' })
    await service.enableAdvisorMode()
    await service.disableAdvisorMode()
    await service.sendConnectionInvite('t@example.com')
    await service.cancelConnectionInvite()
    await service.removeConnection()
    await service.clearUsagePeriod()

    expect(adapter.getPreferences).toHaveBeenCalledTimes(1)
    expect(adapter.getConnectionState).toHaveBeenCalledTimes(1)
    expect(adapter.saveProfile).toHaveBeenCalledWith({
      firstName: 'B',
      lastName: 'Teacher',
    })
    expect(adapter.sendConnectionInvite).toHaveBeenCalledWith('t@example.com')
    expect(adapter.clearUsagePeriod).toHaveBeenCalledTimes(1)
  })

  it('returns deterministic safe fallbacks when unconfigured', async () => {
    await expect(unconfiguredSettingsService.getPreferences()).resolves.toBeNull()
    await expect(unconfiguredSettingsService.getConnectionState()).resolves.toEqual({
      connection: null,
      pendingInvite: null,
    })
    await expect(
      unconfiguredSettingsService.saveProfile({
        firstName: 'Name',
        lastName: 'Teacher',
      })
    ).resolves.toEqual({ success: false, error: 'Settings service is not configured' })
    await expect(unconfiguredSettingsService.sendConnectionInvite('x@y.com')).resolves.toEqual({
      ok: false,
      error: 'Settings service is not configured',
    })
  })
})
