import { describe, expect, it, vi } from 'vitest'
import { getMockKV, resetMockKV, shouldUseMockKV } from '../mock'

// Sample cache contract tests:
// These cases document expected cache semantics (TTL, NX writes, key patterns,
// set/hash/zset behavior) that downstream adapters should preserve.
describe('kv mock (sample cache contract)', () => {
  it('supports NX semantics and expiry across set/setnx/expire/mget', async () => {
    resetMockKV()
    const kv = getMockKV()

    expect(await kv.set('k1', 'v1', { nx: true })).toBe('OK')
    expect(await kv.set('k1', 'v2', { nx: true })).toBeNull()

    expect(await kv.setnx('k2', 'v2')).toBe(1)
    expect(await kv.setnx('k2', 'v3')).toBe(0)
    expect(await kv.expire('k2', 1)).toBe(1)
    expect(await kv.expire('missing', 1)).toBe(0)

    await vi.waitFor(async () => {
      const values = await kv.mget<string>('k1', 'k2')
      expect(values[0]).toBe('v1')
      expect(values[1]).toBeNull()
    }, { timeout: 1500 })
  })

  it('supports hash helpers and delete behavior', async () => {
    resetMockKV()
    const kv = getMockKV()

    await kv.hmset('h', { a: '1', b: '2' })
    expect(await kv.hget('h', 'a')).toBe('1')
    expect(await kv.hget('h', 'missing')).toBeNull()
    expect(await kv.hgetall<Record<string, string>>('h')).toEqual({ a: '1', b: '2' })

    expect(await kv.del('h')).toBe(1)
    expect(await kv.del('h')).toBe(0)
  })

  it('supports sorted set and set collection operations', async () => {
    resetMockKV()
    const kv = getMockKV()

    expect(await kv.zadd('z', { score: 1, member: 'a' })).toBe(1)
    expect(await kv.zadd('z', { score: 5, member: 'b' })).toBe(1)
    expect(await kv.zadd('z', { score: 2, member: 'a' })).toBe(0)

    expect(await kv.zcard('z')).toBe(2)
    expect(await kv.zrange('z', 0, -1)).toEqual(['a', 'b'])
    expect(await kv.zrange('z', 0, -1, { rev: true })).toEqual(['b', 'a'])
    expect(await kv.zrem('z', 'b')).toBe(1)
    expect(await kv.zrem('z', 'b')).toBe(0)

    expect(await kv.sadd('s', 'x', 'y', 'x')).toBe(2)
    expect(await kv.scard('s')).toBe(2)
    expect((await kv.smembers('s')).sort()).toEqual(['x', 'y'])
  })

  it('supports keys matching, pipeline execution, and internal observability helpers', async () => {
    resetMockKV()
    const kv = getMockKV()

    await kv
      .pipeline()
      .set('pipe:1', 'one')
      .incr('count')
      .incrby('count', 2)
      .setex('pipe:ttl', 1, 'temp')
      .exec()

    expect(await kv.get('count')).toBe(3)
    expect((await kv.keys('pipe:*')).sort()).toEqual(['pipe:1', 'pipe:ttl'])

    kv.__setKey('manual:key', 'manual')
    expect(await kv.get('manual:key')).toBe('manual')

    const log = kv.__getCallLog()
    expect(log.some(entry => entry.method === 'set')).toBe(true)
    expect(log.some(entry => entry.method === 'incr')).toBe(true)
    expect(log.some(entry => entry.method === 'keys')).toBe(true)

    const snapshot = kv.__getStore()
    expect(snapshot['manual:key']).toBe('manual')
  })

  it('uses env flag to decide whether mock kv should be enabled', () => {
    const original = process.env.MOCK_REDIS
    process.env.MOCK_REDIS = '1'
    expect(shouldUseMockKV()).toBe(true)
    process.env.MOCK_REDIS = '0'
    expect(shouldUseMockKV()).toBe(false)
    process.env.MOCK_REDIS = original
  })
})
