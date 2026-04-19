import { describe, expect, it, vi } from 'vitest'
import { getMockKV, resetMockKV, shouldUseMockKV } from '..'

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

  it('supports pipeline commands for del, hash, sorted set, and set operations', async () => {
    resetMockKV()
    const kv = getMockKV()

    // Seed some data to operate on
    await kv.hmset('ph', { x: '1', y: '2' })
    await kv.zadd('pz', { score: 1, member: 'a' })
    await kv.zadd('pz', { score: 2, member: 'b' })
    await kv.set('pd', 'to-delete')

    const results = await kv
      .pipeline()
      .get('pd')
      .hgetall('ph')
      .hmset('ph2', { k: 'v' })
      .zadd('pz2', { score: 5, member: 'm' })
      .zrem('pz', 'a')
      .zrange('pz', 0, -1)
      .zcard('pz')
      .sadd('ps', 'a', 'b')
      .scard('ps')
      .del('pd')
      .exec()

    // get('pd') → 'to-delete'
    expect(results[0]).toBe('to-delete')
    // hgetall('ph') → { x: '1', y: '2' }
    expect(results[1]).toEqual({ x: '1', y: '2' })
    // zrem('pz', 'a') → 1
    expect(results[4]).toBe(1)
    // zrange('pz', 0, -1) → ['b'] (after removing 'a')
    expect(results[5]).toEqual(['b'])
    // zcard('pz') → 1
    expect(results[6]).toBe(1)
    // sadd('ps', 'a', 'b') → 2
    expect(results[7]).toBe(2)
    // scard('ps') → 2
    expect(results[8]).toBe(2)
    // del('pd') → 1
    expect(results[9]).toBe(1)

    // After pipeline: pd should be gone
    expect(await kv.get('pd')).toBeNull()
  })

  it('handles zrange stop index, zrem on missing key, and zcard on non-array', async () => {
    resetMockKV()
    const kv = getMockKV()

    // zrange with a real stop index (covers line 120 stop !== -1 branch)
    await kv.zadd('z', { score: 1, member: 'a' })
    await kv.zadd('z', { score: 2, member: 'b' })
    await kv.zadd('z', { score: 3, member: 'c' })
    expect(await kv.zrange('z', 0, 1)).toEqual(['a', 'b'])

    // zrem on a key that doesn't exist (covers line 141 !this.store[key] branch)
    expect(await kv.zrem('missing:zset', 'x')).toBe(0)

    // zcard on a key that holds a non-array value (covers line 155 false branch)
    kv.__setKey('bad:zset', 'not-an-array')
    expect(await kv.zcard('bad:zset')).toBe(0)
  })

  it('returns null/empty for expired keys across all read methods', async () => {
    resetMockKV()
    const kv = getMockKV()

    // Seed values
    await kv.set('str:exp', 'value')
    await kv.setnx('nx:exp', 'value')
    await kv.hmset('hash:exp', { f: '1' })
    await kv.zadd('z:exp', { score: 1, member: 'a' })
    await kv.sadd('s:exp', 'x')

    // Set all to past expiry (-1 second) to guarantee isExpired fires immediately
    await kv.expire('str:exp', -1)
    await kv.expire('nx:exp', -1)
    await kv.expire('hash:exp', -1)
    await kv.expire('z:exp', -1)
    await kv.expire('s:exp', -1)

    // get on expired key (mock.ts line 31)
    expect(await kv.get('str:exp')).toBeNull()

    // mget with expired key mixed with live key (mock.ts line 39)
    await kv.set('live', 'yes')
    const mgetResult = await kv.mget<string>('str:exp', 'live')
    expect(mgetResult[0]).toBeNull()
    expect(mgetResult[1]).toBe('yes')

    // setnx on expired key treats it as missing → returns 1 (mock.ts line 59)
    const setnxResult = await kv.setnx('nx:exp', 'new')
    expect(setnxResult).toBe(1)

    // hgetall on expired key (mock.ts line 93) — must come before hget clears expiry
    expect(await kv.hgetall('hash:exp')).toBeNull()

    // hget on expired key (mock.ts line 99) — seed fresh since hgetall cleared expiry entry
    await kv.hmset('hash:exp2', { f: '1' })
    await kv.expire('hash:exp2', -1)
    expect(await kv.hget('hash:exp2', 'f')).toBeNull()

    // zcard on expired key
    expect(await kv.zcard('z:exp')).toBe(0)

    // scard on expired key
    expect(await kv.scard('s:exp')).toBe(0)

    // smembers on expired key — re-seed since scard cleared the expiry entry
    await kv.sadd('s:exp2', 'x')
    await kv.expire('s:exp2', -1)
    expect(await kv.smembers('s:exp2')).toEqual([])

    // zrange on expired key — re-seed since zcard cleared the expiry entry
    await kv.zadd('z:exp2', { score: 1, member: 'a' })
    await kv.expire('z:exp2', -1)
    expect(await kv.zrange('z:exp2', 0, -1)).toEqual([])
  })

  it('handles missing zset key and score ?? 0 fallback in zrange', async () => {
    resetMockKV()
    const kv = getMockKV()

    // zrange on a key that was never set — hits the || [] branch (mock.ts line 114)
    expect(await kv.zrange('never:set', 0, -1)).toEqual([])

    // Inject a malformed zset with two scoreless entries — both scoreA and scoreB
    // take the ?? 0 branch (mock.ts lines 116-117)
    kv.__setKey('z:malformed', [{ member: 'b' }, { member: 'a' }])
    const result = await kv.zrange('z:malformed', 0, -1)
    // Both have score undefined → 0, stable sort → original order or alphabetical
    expect(result).toHaveLength(2)
  })

  it('returns null from hgetall when key is absent, and null from hget when value is not an object', async () => {
    resetMockKV()
    const kv = getMockKV()

    // hgetall on a key that doesn't exist — hits the ?? null branch (mock.ts line 94)
    expect(await kv.hgetall('never:set')).toBeNull()

    // hget where stored value is a string, not an object (mock.ts line 101)
    kv.__setKey('str:not:hash', 'plain-string')
    expect(await kv.hget('str:not:hash', 'field')).toBeNull()
  })

  it('handles type mismatches and expired keys for set and counter operations', async () => {
    resetMockKV()
    const kv = getMockKV()

    // incr on a non-number value falls back to 0 + 1 (covers line 191)
    kv.__setKey('bad:counter', 'not-a-number')
    const incrResult = await kv.incr('bad:counter')
    expect(incrResult).toBe(1)

    // incrby on a non-number value falls back to 0 + n (covers line 199)
    kv.__setKey('bad:counter2', 'nope')
    const incrbyResult = await kv.incrby('bad:counter2', 5)
    expect(incrbyResult).toBe(5)

    // scard on a non-Set key returns 0 (covers line 178 false branch)
    kv.__setKey('not:a:set', 'string-value')
    expect(await kv.scard('not:a:set')).toBe(0)

    // smembers on a non-Set key returns [] (covers line 185 false branch)
    kv.__setKey('not:a:set2', 42)
    expect(await kv.smembers('not:a:set2')).toEqual([])
  })

  it('supports set with ex option and pipeline setnx command', async () => {
    resetMockKV()
    const kv = getMockKV()

    // set with ex option (covers mock.ts line 52 — expiry branch)
    await kv.set('ttl:key', 'value', { ex: 3600 })
    expect(await kv.get('ttl:key')).toBe('value')

    // pipeline setnx (covers mock.ts lines 222-223 — pipeline.setnx branch)
    const results = await kv
      .pipeline()
      .setnx('nx:key', 'first')
      .setnx('nx:key', 'second')
      .exec()

    expect(results[0]).toBe(1)  // first write: key absent
    expect(results[1]).toBe(0)  // second write: key exists
    expect(await kv.get('nx:key')).toBe('first')
  })

  it('uses env flag to decide whether mock kv should be enabled', () => {
    const original = process.env.MOCK_CACHE
    process.env.MOCK_CACHE = '1'
    expect(shouldUseMockKV()).toBe(true)
    process.env.MOCK_CACHE = '0'
    expect(shouldUseMockKV()).toBe(false)
    process.env.MOCK_CACHE = original
  })
})
