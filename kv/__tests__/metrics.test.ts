import { describe, expect, it, beforeEach } from 'vitest'
import { recordKVOp, getKVMetricsSnapshot, resetKVMetrics } from '../metrics'

describe('kv metrics', () => {
    beforeEach(() => {
        resetKVMetrics()
    })

    it('records ops and accumulates totals', () => {
        recordKVOp('get', 10, false)
        recordKVOp('get', 20, false)
        recordKVOp('set', 5, true)

        const snap = getKVMetricsSnapshot()
        expect(snap.totalCalls).toBe(3)
        expect(snap.totalErrors).toBe(1)
        expect(snap.byOpSummary['get'].calls).toBe(2)
        expect(snap.byOpSummary['get'].errors).toBe(0)
        expect(snap.byOpSummary['get'].avgMs).toBe(15)
        expect(snap.byOpSummary['get'].maxMs).toBe(20)
        expect(snap.byOpSummary['set'].errors).toBe(1)
    })

    it('computes p50 and p95 percentiles from samples', () => {
        // 10 samples: 1..10
        for (let i = 1; i <= 10; i++) {
            recordKVOp('get', i, false)
        }
        const snap = getKVMetricsSnapshot()
        expect(snap.byOpSummary['get'].p50Ms).toBeGreaterThanOrEqual(5)
        expect(snap.byOpSummary['get'].p95Ms).toBeGreaterThanOrEqual(9)
        expect(snap.byOpSummary['get'].sampleCount).toBe(10)
    })

    it('returns 0 for percentile on empty sample set', () => {
        // snapshot with no ops recorded — byOpSummary is empty, totals are zero
        const snap = getKVMetricsSnapshot()
        expect(snap.totalCalls).toBe(0)
        expect(snap.byOpSummary).toEqual({})
    })

    it('evicts oldest sample when sample buffer is full', () => {
        // Record 513 ops — buffer max is 512, oldest should be shifted out
        for (let i = 0; i < 513; i++) {
            recordKVOp('get', i, false)
        }
        const snap = getKVMetricsSnapshot()
        expect(snap.byOpSummary['get'].sampleCount).toBe(512)
    })

    it('resets all counters and returns a clean snapshot', () => {
        recordKVOp('get', 10, false)
        recordKVOp('set', 5, true)

        const after = resetKVMetrics()
        expect(after.totalCalls).toBe(0)
        expect(after.totalErrors).toBe(0)
        expect(after.byOpSummary).toEqual({})
        expect(typeof after.lastResetAt).toBe('string')
    })
})
