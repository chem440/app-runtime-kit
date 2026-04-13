import { describe, expect, it, vi } from 'vitest'
import { createSubscriptionMetricsService } from '../subscriptionMetrics'

describe('platform subscription metrics service', () => {
    it('summarizes grouped event counts', async () => {
        const createEvent = vi.fn(async () => {})
        const getEventCounts = vi.fn(async () => [
            { eventType: 'cancel', count: 3 },
            { eventType: 'reactivate', count: 1 },
            { eventType: 'audit_write_failure', count: 2 },
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
            reconciliationOverwrites: 0,
            period: { start, end },
        })
    })

    it('logs fire-and-forget cancel events via store', async () => {
        const createEvent = vi.fn(async () => {})
        const getEventCounts = vi.fn(async () => [])
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createSubscriptionMetricsService({ createEvent, getEventCounts }, logger)

        service.logSubscriptionCancel('user_1', 'PRO')
        await Promise.resolve()
        await Promise.resolve()

        expect(createEvent).toHaveBeenCalledWith({
            userId: 'user_1',
            eventType: 'cancel',
            tier: 'PRO',
        })
    })
})
