import { describe, expect, it } from 'vitest'
import { getWeekKey, getWeekStartInZone, getWeekStartPT } from '../week'

describe('platform telemetry week utilities', () => {
    it('computes week start and key in Pacific Time (default)', () => {
        const date = new Date('2026-02-12T12:00:00.000Z')
        const weekStart = getWeekStartInZone(date)
        const weekKey = getWeekKey(date)

        expect(weekStart.toISOString()).toBe('2026-02-08T08:00:00.000Z')
        expect(weekKey).toBe('2026-W07')
    })

    it('computes week start in a caller-supplied timezone', () => {
        const date = new Date('2026-02-12T12:00:00.000Z')
        // UTC week start for 2026-02-12 should be Sunday 2026-02-08T00:00:00Z
        const weekStart = getWeekStartInZone(date, 'UTC')
        expect(weekStart.toISOString()).toBe('2026-02-08T00:00:00.000Z')
        expect(getWeekKey(date, 'UTC')).toBe('2026-W07')
    })

    it('getWeekStartPT is backwards-compatible with getWeekStartInZone PT', () => {
        const date = new Date('2026-02-12T12:00:00.000Z')
        expect(getWeekStartPT(date).toISOString()).toBe(getWeekStartInZone(date).toISOString())
    })
})
