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

    it('handles positive-offset timezone east of UTC (Asia/Tokyo, UTC+9)', () => {
        // 2026-02-12T12:00Z is 2026-02-12 21:00 JST (Thursday)
        // Week start in JST = Sunday 2026-02-08 00:00 JST = 2026-02-07T15:00:00Z
        // That Sunday is in W06 of 2026
        const date = new Date('2026-02-12T12:00:00.000Z')
        const weekStart = getWeekStartInZone(date, 'Asia/Tokyo')
        expect(weekStart).toBeInstanceOf(Date)
        expect(isNaN(weekStart.getTime())).toBe(false)
        expect(getWeekKey(date, 'Asia/Tokyo')).toBe('2026-W06')
    })

    it('handles far-east timezone where offset correction branch fires (Pacific/Auckland, UTC+13)', () => {
        // Pacific/Auckland is UTC+13 in NZDT — offset > 12 triggers the correction branch
        const date = new Date('2026-02-12T12:00:00.000Z')
        const weekStart = getWeekStartInZone(date, 'Pacific/Auckland')
        expect(weekStart).toBeInstanceOf(Date)
        expect(isNaN(weekStart.getTime())).toBe(false)
    })

    it('getWeekStartPT is backwards-compatible with getWeekStartInZone PT', () => {
        const date = new Date('2026-02-12T12:00:00.000Z')
        expect(getWeekStartPT(date).toISOString()).toBe(getWeekStartInZone(date).toISOString())
    })
})
