import { describe, expect, it, vi } from 'vitest'
import { createTierChangeLoggerService } from '../tierChangeLogger'

describe('platform tier change logger service', () => {
    it('skips duplicate stripe events', async () => {
        const store = {
            findByStripeEventId: vi.fn(async () => true),
            create: vi.fn(async () => {}),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        await service.logTierChangeAsync({
            userId: 'u1',
            fromTier: 'FREE',
            toTier: 'TIER_1',
            reason: 'upgrade',
            stripeEventId: 'evt_123',
        })

        expect(store.findByStripeEventId).toHaveBeenCalledWith('evt_123')
        expect(store.create).not.toHaveBeenCalled()
    })

    it('persists non-duplicate events', async () => {
        const store = {
            findByStripeEventId: vi.fn(async () => false),
            create: vi.fn(async () => {}),
        }
        const logger = { debug: vi.fn(), error: vi.fn() }
        const service = createTierChangeLoggerService(store, logger)

        await service.logTierChangeAsync({
            userId: 'u2',
            fromTier: 'TIER_1',
            toTier: 'FREE',
            reason: 'churn',
            stripeEventId: 'evt_456',
        })

        expect(store.create).toHaveBeenCalledWith({
            userId: 'u2',
            fromTier: 'TIER_1',
            toTier: 'FREE',
            reason: 'churn',
            stripeEventId: 'evt_456',
        })
    })
})
