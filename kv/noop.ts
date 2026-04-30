import type { KVAdapter, KVPipeline } from './types'

/**
 * No-op KV adapter. Every call resolves immediately with the
 * "empty" value for its return type. Nothing is stored.
 *
 * Activated by DISABLE_CACHE=true — use when you want to run the
 * app without any cache/Redis dependency (local dev, etc.).
 */
class NoopKV implements KVAdapter {
  async get<T = unknown>(): Promise<T | null> { return null }
  async mget<T = unknown>(...keys: string[]): Promise<(T | null)[]> { return keys.map(() => null) }
  async set(): Promise<'OK'> { return 'OK' }
  async setnx(): Promise<number> { return 0 }
  async setex(): Promise<'OK'> { return 'OK' }
  async del(): Promise<number> { return 0 }
  async expire(): Promise<number> { return 0 }
  async incr(): Promise<number> { return 0 }
  async incrby(): Promise<number> { return 0 }
  async hgetall<T = unknown>(): Promise<T | null> { return null }
  async hget(): Promise<string | null> { return null }
  async hmset(): Promise<'OK'> { return 'OK' }
  async zrange(): Promise<string[]> { return [] }
  async zadd(): Promise<number> { return 0 }
  async zrem(): Promise<number> { return 0 }
  async zcard(): Promise<number> { return 0 }
  async sadd(): Promise<number> { return 0 }
  async scard(): Promise<number> { return 0 }
  async smembers(): Promise<string[]> { return [] }
  async keys(): Promise<string[]> { return [] }

  pipeline(): KVPipeline {
    const self: KVPipeline = {
      get: () => self,
      set: () => self,
      setnx: () => self,
      del: () => self,
      hgetall: () => self,
      hmset: () => self,
      zadd: () => self,
      zrem: () => self,
      zrange: () => self,
      zcard: () => self,
      incr: () => self,
      incrby: () => self,
      expire: () => self,
      sadd: () => self,
      scard: () => self,
      setex: () => self,
      exec: async () => [],
    }
    return self
  }
}

let noopInstance: NoopKV | null = null

export function getNoopKV(): NoopKV {
  if (!noopInstance) {
    noopInstance = new NoopKV()
  }
  return noopInstance
}

export function shouldDisableCache(): boolean {
  return process.env.DISABLE_CACHE === 'true'
}
