import { describe, expect, it, vi } from 'vitest'
import { createTierChangeLoggerService } from '../tierChangeLogger'

async function flushPromises() {
    await Promise.resolve()
    await Promise.resolve()
}

describe('platform tier change logger service', () => {
    it('skips duplicate billing events', async () => {
        const store = {
            findByBillingEventId: vi.fn(async () => true),
            create: vi.fn(async () => {}),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        await service.logTierChangeAsync({
            userId: 'u1',
            fromTier: 'FREE',
            toTier: 'TIER_1',
            reason: 'upgrade',
            billingEventId: 'evt_123',
        })

        expect(store.findByBillingEventId).toHaveBeenCalledWith('evt_123')
        expect(store.create).not.toHaveBeenCalled()
    })

    it('persists non-duplicate events', async () => {
        const store = {
            findByBillingEventId: vi.fn(async () => false),
            create: vi.fn(async () => {}),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        await service.logTierChangeAsync({
            userId: 'u2',
            fromTier: 'TIER_1',
            toTier: 'FREE',
            reason: 'churn',
            billingEventId: 'evt_456',
        })

        expect(store.create).toHaveBeenCalledWith({
            userId: 'u2',
            fromTier: 'TIER_1',
            toTier: 'FREE',
            reason: 'churn',
            billingEventId: 'evt_456',
        })
    })

    it('logs null fromTier as "null" string in debug output', async () => {
        const store = {
            findByBillingEventId: vi.fn(async () => false),
            create: vi.fn(async () => {}),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        await service.logTierChangeAsync({
            userId: 'u_null',
            fromTier: null,
            toTier: 'FREE',
            reason: 'signup',
        })

        expect(store.create).toHaveBeenCalled()
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('null -> FREE')
        )
    })

    it('logTierChange fires and forgets, logging errors on failure', async () => {
        const writeError = new Error('db unavailable')
        const store = {
            findByBillingEventId: vi.fn(async () => false),
            create: vi.fn(async () => { throw writeError }),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        // Should not throw — fire-and-forget
        service.logTierChange({ userId: 'u3', fromTier: null, toTier: 'FREE', reason: 'signup' })

        await flushPromises()

        expect(logger.error).toHaveBeenCalledWith(
            '[TierChangeLogger] Failed to log tier change:',
            writeError
        )
    })
})
