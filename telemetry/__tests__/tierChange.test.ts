import { describe, expect, it } from 'vitest'
import { determineTierChangeReason } from '../tierChange'

const ranks = { LIGHT: 0, PRO: 1, PREMIUM: 2, ENTERPRISE: 3 }

describe('platform tier change reason', () => {
    it('classifies upgrade/downgrade/churn/reactivation using caller-supplied ranks', () => {
        expect(determineTierChangeReason('LIGHT', 'PRO', false, ranks)).toBe('upgrade')
        expect(determineTierChangeReason('PREMIUM', 'PRO', false, ranks)).toBe('downgrade')
        expect(determineTierChangeReason('PRO', 'LIGHT', false, ranks)).toBe('churn')
        expect(determineTierChangeReason('LIGHT', 'PRO', true, ranks)).toBe('reactivation')
    })

    it('returns signup when fromTier is null', () => {
        expect(determineTierChangeReason(null, 'PRO', false, ranks)).toBe('signup')
    })

    it('uses custom freeBaseTierId for churn classification', () => {
        const customRanks = { FREE: 0, BASIC: 1, PLUS: 2 }
        expect(determineTierChangeReason('BASIC', 'FREE', false, customRanks, 'FREE')).toBe('churn')
        expect(determineTierChangeReason('PLUS', 'BASIC', false, customRanks, 'FREE')).toBe('downgrade')
    })

    it('defaults gracefully when unknown tiers are passed without a rank map', () => {
        // Unknown tiers default to rank 0 — same rank = signup classification
        expect(determineTierChangeReason('UNKNOWN_A', 'UNKNOWN_B')).toBe('signup')
    })
})
