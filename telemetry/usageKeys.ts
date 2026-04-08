export function usageRedisKey(userId: string, weekKey: string, capability: string, metric: string): string {
    return `ai:usage:${userId}:${weekKey}:${capability}:${metric}`
}

export function getMonthKey(date: Date = new Date()): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthlyUsageRedisKey(monthKey: string, capability: string, metric: string): string {
    return `ai:monthly:${monthKey}:${capability}:${metric}`
}

export function monthlyUsersRedisKey(monthKey: string, capability: string): string {
    return `ai:monthly:${monthKey}:${capability}:users`
}

export function monthlyFlushLockRedisKey(monthKey: string): string {
    return `ai:monthly:flush_lock:${monthKey}`
}
