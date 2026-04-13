import { describe, expect, it } from 'vitest'
import { getWeekKey, getWeekStartPT } from '../week'

describe('platform telemetry week utilities', () => {
    it('computes PT week start and key deterministically', () => {
        const date = new Date('2026-02-12T12:00:00.000Z')
        const weekStart = getWeekStartPT(date)
        const weekKey = getWeekKey(date)

        expect(weekStart.toISOString()).toBe('2026-02-08T08:00:00.000Z')
        expect(weekKey).toBe('2026-W07')
    })
})
