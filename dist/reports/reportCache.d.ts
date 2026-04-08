export interface ReportCacheStore {
    read(cacheKey: string): Promise<{
        data: unknown;
        fetchedAt: Date;
    } | null>;
    write(entry: {
        cacheKey: string;
        queryType: string;
        period: string;
        data: unknown;
        fetchedAt: Date;
    }): Promise<void>;
    deleteByQueryType(queryType?: string): Promise<number>;
    cleanupOlderThan(cutoff: Date): Promise<number>;
    readFetchedAt(cacheKey: string): Promise<Date | null>;
}
interface ReportCacheLogger {
    error: (message: string, error: unknown) => void;
}
export interface ReportCacheServiceOptions {
    store: ReportCacheStore;
    logger?: ReportCacheLogger;
    defaultTtlMs?: number;
    ttlByType?: Record<string, number>;
}
export declare function createReportCacheService(options: ReportCacheServiceOptions): {
    getReportCache: <T>(type: string, period: string, queryOptions?: Record<string, unknown>) => Promise<T | null>;
    setReportCache: <T>(type: string, period: string, data: T, queryOptions?: Record<string, unknown>) => Promise<void>;
    invalidateReportCache: (type?: string) => Promise<number>;
    cleanupReportCache: (maxAgeMs?: number) => Promise<number>;
    withReportCache: <T>(type: string, period: string, query: () => Promise<T>, queryOptions?: Record<string, unknown>) => Promise<T>;
    getTabCache: <T>(tab: string, period: string, queryOptions?: Record<string, unknown>) => Promise<T | null>;
    setTabCache: <T>(tab: string, period: string, data: T, queryOptions?: Record<string, unknown>) => Promise<void>;
    invalidateTabCache: (tab?: string, allTabs?: readonly string[]) => Promise<number>;
    withTabCache: <T>(tab: string, period: string, fetcher: () => Promise<T>, queryOptions?: Record<string, unknown>) => Promise<{
        data: T;
        fromCache: boolean;
    }>;
    getTabCacheStatus: (period: string, tabs: readonly string[]) => Promise<Record<string, {
        cached: boolean;
        age: number | null;
    }>>;
};
export {};
