import { describe, expect, it, vi } from 'vitest'
import { getMockRedis, resetMockRedis, shouldUseMockRedis } from '../mock'

// Sample cache contract tests:
// These cases document expected cache semantics (TTL, NX writes, key patterns,
// set/hash/zset behavior) that downstream adapters should preserve.
describe('redis mock (sample cache contract)', () => {
  it('supports NX semantics and expiry across set/setnx/expire/mget', async () => {
    resetMockRedis()
    const redis = getMockRedis()

    expect(await redis.set('k1', 'v1', { nx: true })).toBe('OK')
    expect(await redis.set('k1', 'v2', { nx: true })).toBeNull()

    expect(await redis.setnx('k2', 'v2')).toBe(1)
    expect(await redis.setnx('k2', 'v3')).toBe(0)
    expect(await redis.expire('k2', 1)).toBe(1)
    expect(await redis.expire('missing', 1)).toBe(0)

    await vi.waitFor(async () => {
      const values = await redis.mget<string>('k1', 'k2')
      expect(values[0]).toBe('v1')
      expect(values[1]).toBeNull()
    }, { timeout: 1500 })
  })

  it('supports hash helpers and delete behavior', async () => {
    resetMockRedis()
    const redis = getMockRedis()

    await redis.hmset('h', { a: '1', b: '2' })
    expect(await redis.hget('h', 'a')).toBe('1')
    expect(await redis.hget('h', 'missing')).toBeNull()
    expect(await redis.hgetall<Record<string, string>>('h')).toEqual({ a: '1', b: '2' })

    expect(await redis.del('h')).toBe(1)
    expect(await redis.del('h')).toBe(0)
  })

  it('supports sorted set and set collection operations', async () => {
    resetMockRedis()
    const redis = getMockRedis()

    expect(await redis.zadd('z', { score: 1, member: 'a' })).toBe(1)
    expect(await redis.zadd('z', { score: 5, member: 'b' })).toBe(1)
    expect(await redis.zadd('z', { score: 2, member: 'a' })).toBe(0)

    expect(await redis.zcard('z')).toBe(2)
    expect(await redis.zrange('z', 0, -1)).toEqual(['a', 'b'])
    expect(await redis.zrange('z', 0, -1, { rev: true })).toEqual(['b', 'a'])
    expect(await redis.zrem('z', 'b')).toBe(1)
    expect(await redis.zrem('z', 'b')).toBe(0)

    expect(await redis.sadd('s', 'x', 'y', 'x')).toBe(2)
    expect(await redis.scard('s')).toBe(2)
    expect((await redis.smembers('s')).sort()).toEqual(['x', 'y'])
  })

  it('supports keys matching, pipeline execution, and internal observability helpers', async () => {
    resetMockRedis()
    const redis = getMockRedis()

    await redis
      .pipeline()
      .set('pipe:1', 'one')
      .incr('count')
      .incrby('count', 2)
      .setex('pipe:ttl', 1, 'temp')
      .exec()

    expect(await redis.get('count')).toBe(3)
    expect((await redis.keys('pipe:*')).sort()).toEqual(['pipe:1', 'pipe:ttl'])

    redis.__setKey('manual:key', 'manual')
    expect(await redis.get('manual:key')).toBe('manual')

    const log = redis.__getCallLog()
    expect(log.some(entry => entry.method === 'set')).toBe(true)
    expect(log.some(entry => entry.method === 'incr')).toBe(true)
    expect(log.some(entry => entry.method === 'keys')).toBe(true)

    const snapshot = redis.__getStore()
    expect(snapshot['manual:key']).toBe('manual')
  })

  it('uses env flag to decide whether mock redis should be enabled', () => {
    const original = process.env.MOCK_REDIS
    process.env.MOCK_REDIS = '1'
    expect(shouldUseMockRedis()).toBe(true)
    process.env.MOCK_REDIS = '0'
    expect(shouldUseMockRedis()).toBe(false)
    process.env.MOCK_REDIS = original
  })
})
