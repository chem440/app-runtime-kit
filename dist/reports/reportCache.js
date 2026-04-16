const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
function defaultLogger() {
    return {
        error: (message, error) => {
            console.error(message, error);
        }
    };
}
function buildCacheKey(type, period, options) {
    const parts = [type, period];
    if (options && Object.keys(options).length > 0) {
        const sortedOptions = Object.keys(options)
            .sort()
            .map(k => `${k}=${options[k]}`)
            .join(',');
        parts.push(sortedOptions);
    }
    return parts.join(':');
}
export function createReportCacheService(options) {
    const store = options.store;
    const logger = options.logger ?? defaultLogger();
    const defaultTtlMs = options.defaultTtlMs ?? DEFAULT_CACHE_TTL_MS;
    // Platform stays app-agnostic: per-query TTL keys are injected by each app.
    const ttlByType = options.ttlByType ?? {};
    async function getReportCache(type, period, queryOptions) {
        const key = buildCacheKey(type, period, queryOptions);
        const ttl = ttlByType[type] ?? defaultTtlMs;
        try {
            const cached = await store.read(key);
            if (!cached)
                return null;
            const age = Date.now() - cached.fetchedAt.getTime();
            if (age > ttl)
                return null;
            return cached.data;
        }
        catch (error) {
            logger.error('[Report Cache] Read error:', error);
            return null;
        }
    }
    async function setReportCache(type, period, data, queryOptions) {
        const key = buildCacheKey(type, period, queryOptions);
        try {
            await store.write({
                cacheKey: key,
                queryType: type,
                period,
                data,
                fetchedAt: new Date()
            });
        }
        catch (error) {
            logger.error('[Report Cache] Write error:', error);
        }
    }
    async function invalidateReportCache(type) {
        try {
            return await store.deleteByQueryType(type);
        }
        catch (error) {
            logger.error('[Report Cache] Invalidation error:', error);
            return 0;
        }
    }
    async function cleanupReportCache(maxAgeMs = 24 * 60 * 60 * 1000) {
        try {
            const cutoff = new Date(Date.now() - maxAgeMs);
            return await store.cleanupOlderThan(cutoff);
        }
        catch (error) {
            logger.error('[Report Cache] Cleanup error:', error);
            return 0;
        }
    }
    async function withReportCache(type, period, query, queryOptions) {
        const cached = await getReportCache(type, period, queryOptions);
        if (cached !== null)
            return cached;
        const data = await query();
        setReportCache(type, period, data, queryOptions).catch(error => {
            logger.error('[Report Cache] Background write failed:', error);
        });
        return data;
    }
    async function getTabCache(tab, period, queryOptions) {
        return getReportCache(`tab:${tab}`, period, queryOptions);
    }
    async function setTabCache(tab, period, data, queryOptions) {
        return setReportCache(`tab:${tab}`, period, data, queryOptions);
    }
    async function invalidateTabCache(tab, allTabs) {
        if (tab)
            return invalidateReportCache(`tab:${tab}`);
        if (!allTabs || allTabs.length === 0)
            return 0;
        let count = 0;
        for (const t of allTabs) {
            count += await invalidateReportCache(`tab:${t}`);
        }
        return count;
    }
    async function withTabCache(tab, period, fetcher, queryOptions) {
        const cached = await getTabCache(tab, period, queryOptions);
        if (cached !== null) {
            return { data: cached, fromCache: true };
        }
        const data = await fetcher();
        setTabCache(tab, period, data, queryOptions).catch(error => {
            logger.error(`[Report Cache] Tab cache write failed for ${tab}:`, error);
        });
        return { data, fromCache: false };
    }
    async function getTabCacheStatus(period, tabs) {
        const status = {};
        for (const tab of tabs) {
            const key = buildCacheKey(`tab:${tab}`, period);
            try {
                const fetchedAt = await store.readFetchedAt(key);
                if (fetchedAt) {
                    status[tab] = {
                        cached: true,
                        age: Math.round((Date.now() - fetchedAt.getTime()) / 1000)
                    };
                }
                else {
                    status[tab] = { cached: false, age: null };
                }
            }
            catch {
                status[tab] = { cached: false, age: null };
            }
        }
        return status;
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
    };
}
