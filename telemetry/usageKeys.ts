export function usageKVKey(userId: string, weekKey: string, capability: string, metric: string): string {
    return `ai:usage:${userId}:${weekKey}:${capability}:${metric}`
}

export function getMonthKey(date: Date = new Date()): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthlyUsageKVKey(monthKey: string, capability: string, metric: string): string {
    return `ai:monthly:${monthKey}:${capability}:${metric}`
}

export function monthlyUsersKVKey(monthKey: string, capability: string): string {
    return `ai:monthly:${monthKey}:${capability}:users`
}

export function monthlyFlushLockKVKey(monthKey: string): string {
    return `ai:monthly:flush_lock:${monthKey}`
}
