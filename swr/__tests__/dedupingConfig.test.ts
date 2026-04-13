import { describe, expect, it } from 'vitest'
import { DEDUPING_DESCRIPTIONS, DEDUPING_INTERVALS, getDedupingInterval } from '../dedupingConfig'

describe('dedupingConfig', () => {
  it('returns the canonical interval for each category', () => {
    expect(getDedupingInterval('REALTIME')).toBe(5_000)
    expect(getDedupingInterval('ANALYTICS')).toBe(30_000)
    expect(getDedupingInterval('PROFILE')).toBe(60_000)
    expect(getDedupingInterval('STATIC')).toBe(300_000)
  })

  it('keeps exported interval and description maps in sync by key', () => {
    expect(Object.keys(DEDUPING_INTERVALS).sort()).toEqual(Object.keys(DEDUPING_DESCRIPTIONS).sort())
  })
})
