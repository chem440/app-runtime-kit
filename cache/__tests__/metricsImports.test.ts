import { describe, expect, it } from 'vitest'
import {
  getKVMetricsSnapshot as getFromCacheMetrics,
  recordKVOp as recordFromCacheMetrics,
  resetKVMetrics as resetFromCacheMetrics,
} from '../metrics'
import * as cacheBarrel from '../index'
import {
  getKVMetricsSnapshot as getFromKVMetrics,
  recordKVOp as recordFromKVMetrics,
  resetKVMetrics as resetFromKVMetrics,
} from '../../kv/metrics'

describe('cache metrics import wiring', () => {
  it('re-exports kv metrics functions with stable references', () => {
    expect(recordFromCacheMetrics).toBe(recordFromKVMetrics)
    expect(getFromCacheMetrics).toBe(getFromKVMetrics)
    expect(resetFromCacheMetrics).toBe(resetFromKVMetrics)
  })

  it('routes metric writes through cache re-export to shared kv metrics state', () => {
    resetFromCacheMetrics()

    recordFromCacheMetrics('cache:get', 12, false)
    recordFromCacheMetrics('cache:get', 30, true)

    const snapshot = getFromKVMetrics()
    expect(snapshot.totalCalls).toBe(2)
    expect(snapshot.totalErrors).toBe(1)
    expect(snapshot.byOpSummary['cache:get']).toEqual(
      expect.objectContaining({
        calls: 2,
        errors: 1,
        maxMs: 30,
        sampleCount: 2,
      })
    )
  })

  it('exposes metrics exports via cache barrel contract', () => {
    expect(cacheBarrel.recordKVOp).toBeTypeOf('function')
    expect(cacheBarrel.getKVMetricsSnapshot).toBeTypeOf('function')
    expect(cacheBarrel.resetKVMetrics).toBeTypeOf('function')
  })
})
