import { describe, expect, it } from 'vitest'
import { determineTierChangeReason } from '../tierChange'

describe('platform tier change reason', () => {
    it('classifies upgrade/downgrade/churn/reactivation', () => {
        expect(determineTierChangeReason('LIGHT', 'PRO')).toBe('upgrade')
        expect(determineTierChangeReason('PREMIUM', 'PRO')).toBe('downgrade')
        expect(determineTierChangeReason('PRO', 'LIGHT')).toBe('churn')
        expect(determineTierChangeReason('LIGHT', 'PRO', true)).toBe('reactivation')
    })
})
