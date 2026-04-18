export function usageKVKey(userId, weekKey, capability, metric) {
    return `ai:usage:${userId}:${weekKey}:${capability}:${metric}`;
}
export function getMonthKey(date = new Date()) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function monthlyUsageKVKey(monthKey, capability, metric) {
    return `ai:monthly:${monthKey}:${capability}:${metric}`;
}
export function monthlyUsersKVKey(monthKey, capability) {
    return `ai:monthly:${monthKey}:${capability}:users`;
}
export function monthlyFlushLockKVKey(monthKey) {
    return `ai:monthly:flush_lock:${monthKey}`;
}
