'use client';
export const DEDUPING_INTERVALS = {
    REALTIME: 5_000,
    ANALYTICS: 30_000,
    PROFILE: 60_000,
    STATIC: 300_000,
};
export function getDedupingInterval(category) {
    return DEDUPING_INTERVALS[category];
}
export const DEDUPING_DESCRIPTIONS = {
    REALTIME: 'Live conversations, polling hooks (5s)',
    ANALYTICS: 'Dashboards, treemaps, cap checks (30s)',
    PROFILE: 'Account info, subscription status (60s, global default)',
    STATIC: 'Warnings, admin reports, rarely-changing data (5min)',
};
