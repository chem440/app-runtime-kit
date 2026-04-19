import { describe, expect, it, vi } from 'vitest'
import { createSubscriptionMetricsService } from '../subscriptionMetrics'

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('platform subscription metrics service', () => {
  it('returns zero for all missing event types when no events exist', async () => {
    const createEvent = vi.fn(async () => {})
    // Empty result set — all four counts default to 0 via ?? 0
    const getEventCounts = vi.fn(async () => [])
    const logger = { debug: vi.fn(), error: vi.fn() }
    const service = createSubscriptionMetricsService({ createEvent, getEventCounts }, logger)
    const start = new Date('2026-03-01T00:00:00.000Z')
    const end = new Date('2026-03-31T23:59:59.999Z')
    const summary = await service.getSubscriptionMetrics(start, end)

    expect(summary).toEqual({
      cancels: 0,
      reactivates: 0,
      auditWriteFailures: 0,
      reconciliationOverwrites: 0,
      period: { start, end },
    })
  })

  it('summarizes grouped event counts and ignores unknown event types', async () => {
    const createEvent = vi.fn(async () => {})
    const getEventCounts = vi.fn(async () => [
      { eventType: 'cancel', count: 3 },
      { eventType: 'reactivate', count: 1 },
      { eventType: 'audit_write_failure', count: 2 },
      { eventType: 'reconciliation_overwrite', count: 4 },
      { eventType: 'unknown_event', count: 99 },
    ])
    const logger = { debug: vi.fn(), error: vi.fn() }

    const service = createSubscriptionMetricsService({ createEvent, getEventCounts }, logger)
    const start = new Date('2026-01-01T00:00:00.000Z')
    const end = new Date('2026-01-31T23:59:59.999Z')
    const summary = await service.getSubscriptionMetrics(start, end)

    expect(summary).toEqual({
      cancels: 3,
      reactivates: 1,
      auditWriteFailures: 2,
      reconciliationOverwrites: 4,
      period: { start, end },
    })
  })

  it('writes all subscription event types and logs success outcomes', async () => {
    const createEvent = vi.fn(async () => {})
    const getEventCounts = vi.fn(async () => [])
    const logger = { debug: vi.fn(), error: vi.fn() }
    const service = createSubscriptionMetricsService({ createEvent, getEventCounts }, logger)

    service.logSubscriptionCancel('user_1', 'PRO')
    service.logSubscriptionReactivate('user_1', 'PRO')
    service.logSubscriptionAuditWriteFailure('user_1', 'markCanceled', 'db timeout')
    service.logReconciliationOverwrite('user_1', 'status_mismatch', 'past_due', 'active')

    await flushPromises()

    expect(createEvent).toHaveBeenNthCalledWith(1, {
      userId: 'user_1',
      eventType: 'cancel',
      tier: 'PRO',
    })
    expect(createEvent).toHaveBeenNthCalledWith(2, {
      userId: 'user_1',
      eventType: 'reactivate',
      tier: 'PRO',
    })
    expect(createEvent).toHaveBeenNthCalledWith(3, {
      userId: 'user_1',
      eventType: 'audit_write_failure',
      operation: 'markCanceled',
      errorMessage: 'db timeout',
    })
    expect(createEvent).toHaveBeenNthCalledWith(4, {
      userId: 'user_1',
      eventType: 'reconciliation_overwrite',
      reason: 'status_mismatch',
      fromState: 'past_due',
      toState: 'active',
    })

    expect(logger.debug).toHaveBeenCalledWith('[SubscriptionMetrics] user_1: cancel (PRO)')
    expect(logger.debug).toHaveBeenCalledWith('[SubscriptionMetrics] user_1: reactivate (PRO)')
    expect(logger.debug).toHaveBeenCalledWith(
      '[SubscriptionMetrics] RECONCILIATION_OVERWRITE user_1: status_mismatch (past_due -> active)'
    )
    expect(logger.error).toHaveBeenCalledWith(
      '[SubscriptionMetrics] AUDIT_WRITE_FAILURE user_1: markCanceled - db timeout'
    )
  })

  it('logs failure diagnostics when event writes fail', async () => {
    const writeError = new Error('write failed')
    const createEvent = vi.fn(async () => {
      throw writeError
    })
    const getEventCounts = vi.fn(async () => [])
    const logger = { debug: vi.fn(), error: vi.fn() }
    const service = createSubscriptionMetricsService({ createEvent, getEventCounts }, logger)

    service.logSubscriptionCancel('user_2', 'FREE')
    service.logSubscriptionReactivate('user_2', 'FREE')
    service.logSubscriptionAuditWriteFailure('user_2', 'updatePeriodEnd', 'deadlock')
    service.logReconciliationOverwrite('user_2', 'downgrade', 'pro', 'free')

    await flushPromises()

    expect(logger.error).toHaveBeenCalledWith('[SubscriptionMetrics] Failed to log cancel:', writeError)
    expect(logger.error).toHaveBeenCalledWith('[SubscriptionMetrics] Failed to log reactivate:', writeError)
    expect(logger.error).toHaveBeenCalledWith(
      '[SubscriptionMetrics] Failed to log audit write failure:',
      writeError
    )
    expect(logger.error).toHaveBeenCalledWith(
      '[SubscriptionMetrics] Failed to log reconciliation overwrite:',
      writeError
    )
  })
})
