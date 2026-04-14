import { describe, expect, it, vi } from 'vitest'
import {
  type SettingsAccountInfo,
  type SettingsServiceAdapter,
  unconfiguredSettingsServiceAdapter,
} from '../../settings/serviceAdapter'
import {
  createSubscriptionServiceFromAdapter,
  unconfiguredSubscriptionService,
} from '../subscriptionService'

describe('subscriptionService', () => {
  it('uses adapter sync as source of truth for account info', async () => {
    const account: SettingsAccountInfo = {
      tier: 'pro',
      tierName: 'Pro',
      isPaid: true,
      isPartner: false,
      status: 'active',
      billingInterval: 'monthly',
      periodEndsAt: '2026-06-01T00:00:00.000Z',
      cancelAt: null,
      paymentFailedAt: null,
      hasCustomer: true,
      hasSubscription: true,
    }

    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      syncAccountInfo: vi.fn(async () => ({ data: account, synced: true, rateLimited: false })),
      openBillingPortal: vi.fn(async () => ({ url: 'https://billing.example.com' })),
      cancelSubscription: vi.fn(async () => ({ success: true })),
      reactivateSubscription: vi.fn(async () => ({ success: true })),
      getBillingUiPolicy: vi.fn(() => ({
        hideSubscriptionWarnings: true,
        canReactivate: true,
        showViewPlansButton: false,
        showLegacySubscriptionWarning: false,
        showEnterpriseMessage: false,
      })),
      refreshUserStatus: vi.fn(),
      invalidateAccountInfo: vi.fn(),
      invalidateSubscriptionWarning: vi.fn(),
    }

    const service = createSubscriptionServiceFromAdapter(adapter)
    await expect(service.getAccountInfo()).resolves.toEqual(account)
    expect(adapter.syncAccountInfo).toHaveBeenCalledWith(false)

    await service.syncAccountInfo(true)
    expect(adapter.syncAccountInfo).toHaveBeenCalledWith(true)

    await service.openBillingPortal()
    await service.cancelSubscription()
    await service.reactivateSubscription()
    service.getBillingUiPolicy(account)
    service.refreshUserStatus()
    service.invalidateAccountInfo()
    service.invalidateSubscriptionWarning()

    expect(adapter.openBillingPortal).toHaveBeenCalledTimes(1)
    expect(adapter.cancelSubscription).toHaveBeenCalledTimes(1)
    expect(adapter.reactivateSubscription).toHaveBeenCalledTimes(1)
    expect(adapter.getBillingUiPolicy).toHaveBeenCalledWith(account)
    expect(adapter.refreshUserStatus).toHaveBeenCalledTimes(1)
    expect(adapter.invalidateAccountInfo).toHaveBeenCalledTimes(1)
    expect(adapter.invalidateSubscriptionWarning).toHaveBeenCalledTimes(1)
  })

  it('returns safe defaults when service is unconfigured', async () => {
    await expect(unconfiguredSubscriptionService.getAccountInfo()).resolves.toMatchObject({
      tier: 'unknown',
      hasSubscription: false,
    })

    await expect(unconfiguredSubscriptionService.syncAccountInfo(false)).resolves.toEqual({
      data: expect.objectContaining({ tier: 'unknown', hasSubscription: false }),
      synced: false,
      rateLimited: false,
    })

    await expect(unconfiguredSubscriptionService.openBillingPortal()).resolves.toEqual({
      error: 'Subscription service is not configured',
    })

    expect(
      unconfiguredSubscriptionService.getBillingUiPolicy({
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
      })
    ).toEqual({
      hideSubscriptionWarnings: false,
      canReactivate: false,
      showViewPlansButton: true,
      showLegacySubscriptionWarning: false,
      showEnterpriseMessage: false,
    })
  })

  it('preserves boundary sync metadata from configured adapter', async () => {
    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      syncAccountInfo: vi.fn(async () => ({
        data: {
          tier: 'free',
          tierName: 'Free',
          isPaid: false,
          isPartner: true,
          status: null,
          billingInterval: null,
          periodEndsAt: null,
          cancelAt: null,
          paymentFailedAt: null,
          hasCustomer: false,
          hasSubscription: false,
          weekResetsAt: '2026-04-20T00:00:00.000Z',
        },
        synced: false,
        rateLimited: true,
        retryAfterSeconds: 30,
      })),
    }

    const service = createSubscriptionServiceFromAdapter(adapter)
    await expect(service.syncAccountInfo(true)).resolves.toEqual({
      data: {
        tier: 'free',
        tierName: 'Free',
        isPaid: false,
        isPartner: true,
        status: null,
        billingInterval: null,
        periodEndsAt: null,
        cancelAt: null,
        paymentFailedAt: null,
        hasCustomer: false,
        hasSubscription: false,
        weekResetsAt: '2026-04-20T00:00:00.000Z',
      },
      synced: false,
      rateLimited: true,
      retryAfterSeconds: 30,
    })
  })

  it('propagates configured adapter failures for account sync', async () => {
    const adapter: SettingsServiceAdapter = {
      ...unconfiguredSettingsServiceAdapter,
      syncAccountInfo: vi.fn(async () => {
        throw new Error('subscription backend timeout')
      }),
    }

    const service = createSubscriptionServiceFromAdapter(adapter)
    await expect(service.getAccountInfo()).rejects.toThrow('subscription backend timeout')
  })
})
