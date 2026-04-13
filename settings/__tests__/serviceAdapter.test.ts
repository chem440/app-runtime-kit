import { describe, expect, it } from 'vitest'
import { unconfiguredSettingsServiceAdapter } from '../serviceAdapter'

describe('platform settings adapter contracts', () => {
    it('supports generic connection methods and legacy aliases', async () => {
        const genericState = await unconfiguredSettingsServiceAdapter.getConnectionState()
        const legacyState = await unconfiguredSettingsServiceAdapter.getMenteeMentorState()

        expect(genericState).toEqual({ connection: null, pendingInvite: null })
        expect(legacyState).toEqual({ mentor: null, pendingInvite: null })

        await expect(unconfiguredSettingsServiceAdapter.enableAdvisorMode()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.becomeMentor()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
    })

    it('returns unconfigured errors for invite and usage reset methods', async () => {
        await expect(unconfiguredSettingsServiceAdapter.sendConnectionInvite('teacher@example.com')).resolves.toEqual({
            ok: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.sendInvite('teacher@example.com')).resolves.toEqual({
            ok: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.clearUsagePeriod()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.clearWeeklyCap()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
    })
})
