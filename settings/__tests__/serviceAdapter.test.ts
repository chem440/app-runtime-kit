import { describe, expect, it } from 'vitest'
import { unconfiguredSettingsServiceAdapter } from '../serviceAdapter'

describe('platform settings adapter contracts', () => {
    it('supports generic connection methods', async () => {
        const state = await unconfiguredSettingsServiceAdapter.getConnectionState()
        expect(state).toEqual({ connection: null, pendingInvite: null })

        await expect(unconfiguredSettingsServiceAdapter.enableAdvisorMode()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
    })

    it('returns unconfigured errors for invite and usage reset methods', async () => {
        await expect(unconfiguredSettingsServiceAdapter.sendConnectionInvite('teacher@example.com')).resolves.toEqual({
            ok: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.cancelConnectionInvite()).resolves.toEqual({
            ok: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.removeConnection()).resolves.toEqual({
            ok: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.disableAdvisorMode()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.clearUsagePeriod()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
    })

    it('returns safe defaults for profile, billing, and subscription actions', async () => {
        await expect(unconfiguredSettingsServiceAdapter.getPreferences()).resolves.toBeNull()
        await expect(unconfiguredSettingsServiceAdapter.getProfile()).resolves.toBeNull()
        await expect(unconfiguredSettingsServiceAdapter.saveProfile({ firstName: 'A', lastName: 'B' })).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.openBillingPortal()).resolves.toEqual({
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.cancelSubscription()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
        await expect(unconfiguredSettingsServiceAdapter.reactivateSubscription()).resolves.toEqual({
            success: false,
            error: 'Settings service adapter is not configured'
        })
    })

    it('returns stable account-sync fallback and tier/billing defaults', async () => {
        await expect(unconfiguredSettingsServiceAdapter.syncAccountInfo(false)).resolves.toEqual({
            data: {
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
            },
            synced: false
        })

        expect(unconfiguredSettingsServiceAdapter.getBillingUiPolicy({
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
        })).toEqual({
            hideSubscriptionWarnings: false,
            canReactivate: true,
            showViewPlansButton: true,
            showLegacySubscriptionWarning: false,
            showEnterpriseMessage: false
        })

        expect(unconfiguredSettingsServiceAdapter.resolveTierBranding('enterprise', 'Enterprise')).toEqual({
            gradient: 'from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800',
            borderColor: 'border-slate-400 dark:border-slate-500',
            tagline: 'Enterprise'
        })
        expect(unconfiguredSettingsServiceAdapter.resolveTierBranding()).toEqual({
            gradient: 'from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800',
            borderColor: 'border-slate-400 dark:border-slate-500',
            tagline: 'Plan details'
        })
    })

    it('provides no-op invalidation hooks', () => {
        expect(() => unconfiguredSettingsServiceAdapter.refreshUserStatus()).not.toThrow()
        expect(() => unconfiguredSettingsServiceAdapter.invalidateAccountInfo()).not.toThrow()
        expect(() => unconfiguredSettingsServiceAdapter.invalidateSubscriptionWarning()).not.toThrow()
    })
})
