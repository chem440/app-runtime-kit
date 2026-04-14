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

  it('preserves boundary payloads from configured adapter responses', async () => {
    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      getPreferences: vi.fn(async () => ({
        hideCompletedLessons: true,
        showPerformanceTimer: false,
        transparencyPreference: 1,
        themePreference: 'dark',
        appDefaults: {
          quality: 'high',
          retries: 0,
          assistantEnabled: false,
          legacy: null,
        },
      })),
      getConnectionState: vi.fn(async () => ({
        connection: {
          id: 'conn_1',
          name: null,
          email: 'advisor@example.com',
        },
        pendingInvite: null,
      })),
      sendConnectionInvite: vi.fn(async () => ({
        ok: true,
        invite: {
          id: 'invite_1',
          inviteEmail: 'new-user@example.com',
          mentorEmail: 'new-user@example.com',
          createdAt: '2026-01-01T00:00:00.000Z',
          status: 'pending',
        },
      })),
    }

    const service = createSettingsServiceFromAdapter(adapter)

    await expect(service.getPreferences()).resolves.toEqual({
      hideCompletedLessons: true,
      showPerformanceTimer: false,
      transparencyPreference: 1,
      themePreference: 'dark',
      appDefaults: {
        quality: 'high',
        retries: 0,
        assistantEnabled: false,
        legacy: null,
      },
    })
    await expect(service.getConnectionState()).resolves.toEqual({
      connection: {
        id: 'conn_1',
        name: null,
        email: 'advisor@example.com',
      },
      pendingInvite: null,
    })
    await expect(service.sendConnectionInvite('new-user@example.com')).resolves.toEqual({
      ok: true,
      invite: {
        id: 'invite_1',
        inviteEmail: 'new-user@example.com',
        mentorEmail: 'new-user@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        status: 'pending',
      },
    })
  })

  it('surfaces configured adapter failures without masking the error', async () => {
    const dependencyFailure = new Error('settings provider unavailable')
    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      saveProfile: vi.fn(async () => {
        throw dependencyFailure
      }),
    }

    const service = createSettingsServiceFromAdapter(adapter)
    await expect(service.saveProfile({ firstName: 'A', lastName: 'B' })).rejects.toThrow(
      'settings provider unavailable'
    )
  })
})
