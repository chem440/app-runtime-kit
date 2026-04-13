import { describe, expect, it, vi } from 'vitest'
import { createReportCacheService } from '../reportCache'

function createMemoryStore() {
  const rows = new Map<string, { queryType: string; period: string; data: unknown; fetchedAt: Date }>()
  return {
    rows,
    store: {
      async read(cacheKey: string) {
        const row = rows.get(cacheKey)
        if (!row) return null
        return { data: row.data, fetchedAt: row.fetchedAt }
      },
      async write(entry: { cacheKey: string; queryType: string; period: string; data: unknown; fetchedAt: Date }) {
        rows.set(entry.cacheKey, {
          queryType: entry.queryType,
          period: entry.period,
          data: entry.data,
          fetchedAt: entry.fetchedAt,
        })
      },
      async deleteByQueryType(queryType?: string) {
        if (!queryType) {
          const count = rows.size
          rows.clear()
          return count
        }
        let count = 0
        for (const [key, row] of rows.entries()) {
          if (row.queryType === queryType) {
            rows.delete(key)
            count += 1
          }
        }
        return count
      },
      async cleanupOlderThan(cutoff: Date) {
        let count = 0
        for (const [key, row] of rows.entries()) {
          if (row.fetchedAt < cutoff) {
            rows.delete(key)
            count += 1
          }
        }
        return count
      },
      async readFetchedAt(cacheKey: string) {
        return rows.get(cacheKey)?.fetchedAt ?? null
      },
    },
  }
}

describe('platform report cache service', () => {
  it('returns cached value when fresh and null when stale', async () => {
    const { store } = createMemoryStore()
    const service = createReportCacheService({ store, defaultTtlMs: 50 })

    await service.setReportCache('custom_metric', '7d', { value: 1 })
    const fresh = await service.getReportCache<{ value: number }>('custom_metric', '7d')
    expect(fresh?.value).toBe(1)

    await new Promise(resolve => setTimeout(resolve, 60))
    const stale = await service.getReportCache<{ value: number }>('custom_metric', '7d')
    expect(stale).toBeNull()
  })

  it('uses withReportCache to avoid duplicate query calls across option-key ordering', async () => {
    const { store } = createMemoryStore()
    const service = createReportCacheService({ store })
    const query = vi.fn(async () => ({ ok: true }))

    const first = await service.withReportCache('databaseSize', '7d', query, { b: '2', a: '1' })
    const second = await service.withReportCache('databaseSize', '7d', query, { a: '1', b: '2' })

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('supports tab cache workflows including tab invalidation variants', async () => {
    const { store } = createMemoryStore()
    const service = createReportCacheService({ store })
    const fetcher = vi.fn(async () => ({ rows: [1, 2, 3] }))

    const first = await service.withTabCache('overview', '30d', fetcher)
    const second = await service.withTabCache('overview', '30d', fetcher)

    expect(first).toEqual({ data: { rows: [1, 2, 3] }, fromCache: false })
    expect(second).toEqual({ data: { rows: [1, 2, 3] }, fromCache: true })
    expect(fetcher).toHaveBeenCalledTimes(1)

    await service.setTabCache('usage', '30d', { rows: [4] })
    expect(await service.invalidateTabCache('overview')).toBe(1)
    expect(await service.invalidateTabCache(undefined, ['usage'])).toBe(1)
    expect(await service.invalidateTabCache(undefined, [])).toBe(0)
  })

  it('returns tab cache status for cached, missing, and read-error tabs', async () => {
    const { store } = createMemoryStore()
    const service = createReportCacheService({ store })

    await service.setTabCache('cached-tab', '7d', { ok: true })
    const realReadFetchedAt = store.readFetchedAt
    store.readFetchedAt = vi.fn(async (cacheKey: string) => {
      if (cacheKey.startsWith('tab:error-tab:')) {
        throw new Error('status lookup failed')
      }
      return realReadFetchedAt(cacheKey)
    })

    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-04-13T00:00:30.000Z').getTime())
    const status = await service.getTabCacheStatus('7d', ['cached-tab', 'missing-tab', 'error-tab'])

    expect(status['cached-tab']?.cached).toBe(true)
    expect(status['cached-tab']?.age).not.toBeNull()
    expect(status['missing-tab']).toEqual({ cached: false, age: null })
    expect(status['error-tab']).toEqual({ cached: false, age: null })

    nowSpy.mockRestore()
  })

  it('logs and fails safely when backing store operations throw', async () => {
    const logger = { error: vi.fn() }
    const store = {
      read: vi.fn(async () => {
        throw new Error('read boom')
      }),
      write: vi.fn(async () => {
        throw new Error('write boom')
      }),
      deleteByQueryType: vi.fn(async () => {
        throw new Error('delete boom')
      }),
      cleanupOlderThan: vi.fn(async () => {
        throw new Error('cleanup boom')
      }),
      readFetchedAt: vi.fn(async () => {
        throw new Error('fetchedAt boom')
      }),
    }

    const service = createReportCacheService({ store, logger })

    await expect(service.getReportCache('x', '7d')).resolves.toBeNull()
    await expect(service.setReportCache('x', '7d', { ok: true })).resolves.toBeUndefined()
    await expect(service.invalidateReportCache('x')).resolves.toBe(0)
    await expect(service.cleanupReportCache()).resolves.toBe(0)
    await expect(service.getTabCacheStatus('7d', ['x'])).resolves.toEqual({
      x: { cached: false, age: null },
    })

    expect(logger.error).toHaveBeenCalledWith('[Report Cache] Read error:', expect.any(Error))
    expect(logger.error).toHaveBeenCalledWith('[Report Cache] Write error:', expect.any(Error))
    expect(logger.error).toHaveBeenCalledWith('[Report Cache] Invalidation error:', expect.any(Error))
    expect(logger.error).toHaveBeenCalledWith('[Report Cache] Cleanup error:', expect.any(Error))
  })
})
