const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000

type CacheKey = string

export interface ReportCacheStore {
    read(cacheKey: string): Promise<{ data: unknown; fetchedAt: Date } | null>
    write(entry: {
        cacheKey: string
        queryType: string
        period: string
        data: unknown
        fetchedAt: Date
    }): Promise<void>
    deleteByQueryType(queryType?: string): Promise<number>
    cleanupOlderThan(cutoff: Date): Promise<number>
    readFetchedAt(cacheKey: string): Promise<Date | null>
}

interface ReportCacheLogger {
    error: (message: string, error: unknown) => void
}

export interface ReportCacheServiceOptions {
    store: ReportCacheStore
    logger?: ReportCacheLogger
    defaultTtlMs?: number
    ttlByType?: Record<string, number>
}

function defaultLogger(): ReportCacheLogger {
    return {
        error: (message, error) => {
            console.error(message, error)
        }
    }
}

function buildCacheKey(type: string, period: string, options?: Record<string, unknown>): CacheKey {
    const parts = [type, period]
    if (options && Object.keys(options).length > 0) {
        const sortedOptions = Object.keys(options)
            .sort()
            .map(k => `${k}=${options[k]}`)
            .join(',')
        parts.push(sortedOptions)
    }
    return parts.join(':')
}

export function createReportCacheService(options: ReportCacheServiceOptions) {
    const store = options.store
    const logger = options.logger ?? defaultLogger()
    const defaultTtlMs = options.defaultTtlMs ?? DEFAULT_CACHE_TTL_MS
    // Platform stays app-agnostic: per-query TTL keys are injected by each app.
    const ttlByType = options.ttlByType ?? {}

    async function getReportCache<T>(
        type: string,
        period: string,
        queryOptions?: Record<string, unknown>
    ): Promise<T | null> {
        const key = buildCacheKey(type, period, queryOptions)
        const ttl = ttlByType[type] ?? defaultTtlMs

        try {
            const cached = await store.read(key)
            if (!cached) return null

            const age = Date.now() - cached.fetchedAt.getTime()
            if (age > ttl) return null

            return cached.data as T
        } catch (error) {
            logger.error('[Report Cache] Read error:', error)
            return null
        }
    }

    async function setReportCache<T>(
        type: string,
        period: string,
        data: T,
        queryOptions?: Record<string, unknown>
    ): Promise<void> {
        const key = buildCacheKey(type, period, queryOptions)

        try {
            await store.write({
                cacheKey: key,
                queryType: type,
                period,
                data,
                fetchedAt: new Date()
            })
        } catch (error) {
            logger.error('[Report Cache] Write error:', error)
        }
    }

    async function invalidateReportCache(type?: string): Promise<number> {
        try {
            return await store.deleteByQueryType(type)
        } catch (error) {
            logger.error('[Report Cache] Invalidation error:', error)
            return 0
        }
    }

    async function cleanupReportCache(maxAgeMs = 24 * 60 * 60 * 1000): Promise<number> {
        try {
            const cutoff = new Date(Date.now() - maxAgeMs)
            return await store.cleanupOlderThan(cutoff)
        } catch (error) {
            logger.error('[Report Cache] Cleanup error:', error)
            return 0
        }
    }

    async function withReportCache<T>(
        type: string,
        period: string,
        query: () => Promise<T>,
        queryOptions?: Record<string, unknown>
    ): Promise<T> {
        const cached = await getReportCache<T>(type, period, queryOptions)
        if (cached !== null) return cached

        const data = await query()
        setReportCache(type, period, data, queryOptions).catch(error => {
            logger.error('[Report Cache] Background write failed:', error)
        })
        return data
    }

    async function getTabCache<T>(
        tab: string,
        period: string,
        queryOptions?: Record<string, unknown>
    ): Promise<T | null> {
        return getReportCache<T>(`tab:${tab}`, period, queryOptions)
    }

    async function setTabCache<T>(
        tab: string,
        period: string,
        data: T,
        queryOptions?: Record<string, unknown>
    ): Promise<void> {
        return setReportCache(`tab:${tab}`, period, data, queryOptions)
    }

    async function invalidateTabCache(tab?: string, allTabs?: readonly string[]): Promise<number> {
        if (tab) return invalidateReportCache(`tab:${tab}`)

        if (!allTabs || allTabs.length === 0) return 0

        let count = 0
        for (const t of allTabs) {
            count += await invalidateReportCache(`tab:${t}`)
        }
        return count
    }

    async function withTabCache<T>(
        tab: string,
        period: string,
        fetcher: () => Promise<T>,
        queryOptions?: Record<string, unknown>
    ): Promise<{ data: T; fromCache: boolean }> {
        const cached = await getTabCache<T>(tab, period, queryOptions)
        if (cached !== null) {
            return { data: cached, fromCache: true }
        }

        const data = await fetcher()
        setTabCache(tab, period, data, queryOptions).catch(error => {
            logger.error(`[Report Cache] Tab cache write failed for ${tab}:`, error)
        })
        return { data, fromCache: false }
    }

    async function getTabCacheStatus(
        period: string,
        tabs: readonly string[]
    ): Promise<Record<string, { cached: boolean; age: number | null }>> {
        const status: Record<string, { cached: boolean; age: number | null }> = {}

        for (const tab of tabs) {
            const key = buildCacheKey(`tab:${tab}`, period)
            try {
                const fetchedAt = await store.readFetchedAt(key)
                if (fetchedAt) {
                    status[tab] = {
                        cached: true,
                        age: Math.round((Date.now() - fetchedAt.getTime()) / 1000)
                    }
                } else {
                    status[tab] = { cached: false, age: null }
                }
            } catch {
                status[tab] = { cached: false, age: null }
            }
        }

        return status
    }

    return {
        getReportCache,
        setReportCache,
        invalidateReportCache,
        cleanupReportCache,
        withReportCache,
        getTabCache,
        setTabCache,
        invalidateTabCache,
        withTabCache,
        getTabCacheStatus
    }
}
