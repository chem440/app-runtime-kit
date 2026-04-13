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
                    fetchedAt: entry.fetchedAt
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
                        count++
                    }
                }
                return count
            },
            async cleanupOlderThan(cutoff: Date) {
                let count = 0
                for (const [key, row] of rows.entries()) {
                    if (row.fetchedAt < cutoff) {
                        rows.delete(key)
                        count++
                    }
                }
                return count
            },
            async readFetchedAt(cacheKey: string) {
                return rows.get(cacheKey)?.fetchedAt ?? null
            }
        }
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

    it('uses withReportCache to avoid duplicate query calls', async () => {
        const { store } = createMemoryStore()
        const service = createReportCacheService({ store })
        const query = vi.fn(async () => ({ ok: true }))

        const first = await service.withReportCache('databaseSize', '7d', query)
        const second = await service.withReportCache('databaseSize', '7d', query)

        expect(first.ok).toBe(true)
        expect(second.ok).toBe(true)
        expect(query).toHaveBeenCalledTimes(1)
    })
})
