export declare function usageRedisKey(userId: string, weekKey: string, capability: string, metric: string): string;
export declare function getMonthKey(date?: Date): string;
export declare function monthlyUsageRedisKey(monthKey: string, capability: string, metric: string): string;
export declare function monthlyUsersRedisKey(monthKey: string, capability: string): string;
export declare function monthlyFlushLockRedisKey(monthKey: string): string;
