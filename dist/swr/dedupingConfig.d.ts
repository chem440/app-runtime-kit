export type DedupingCategory = 'REALTIME' | 'ANALYTICS' | 'PROFILE' | 'STATIC';
export declare const DEDUPING_INTERVALS: Record<DedupingCategory, number>;
export declare function getDedupingInterval(category: DedupingCategory): number;
export declare const DEDUPING_DESCRIPTIONS: Record<DedupingCategory, string>;
