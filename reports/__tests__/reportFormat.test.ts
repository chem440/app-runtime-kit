import { describe, expect, it } from 'vitest'
import {
    formatBytes,
    formatCost,
    formatDate,
    formatNumber,
    formatPercent
} from '../format'

describe('platform report format utilities', () => {
    it('formats numbers and costs', () => {
        expect(formatNumber(12345)).toBe('12,345')
        expect(formatCost(0.005)).toBe('$0.0050')
        expect(formatCost(12.3)).toBe('$12.30')
    })

    it('formats bytes and percentage defensively', () => {
        expect(formatBytes(2048)).toBe('2.0 KB')
        expect(formatBytes(undefined)).toBe('0 B')
        expect(formatPercent(25, 100)).toBe('25%')
        expect(formatPercent(5, 0)).toBe('0%')
    })

    it('formats date as m/d/yyyy', () => {
        expect(formatDate('2026-04-05T12:00:00.000Z')).toBe('4/5/2026')
    })
})
