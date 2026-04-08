/**
 * REPORT FORMATTING UTILITIES
 *
 * Consistent formatting for report values.
 */
export declare function formatNumber(num: number | undefined | null): string;
export declare function formatCost(cost: number | undefined | null): string;
export declare function formatDate(dateStr: string): string;
export declare function formatBytes(bytes: number | undefined | null): string;
export declare function formatPercent(value: number | undefined | null, total: number | undefined | null, decimals?: number): string;
