import { determineTierChangeReason, type TierChangeReason } from './tierChange';
export { determineTierChangeReason };
export type { TierChangeReason };
export interface TierChangeParams {
    userId: string;
    fromTier: string | null;
    toTier: string;
    reason: TierChangeReason;
    stripeEventId?: string;
}
interface TierChangeStore {
    findByStripeEventId(stripeEventId: string): Promise<boolean>;
    create(params: TierChangeParams): Promise<void>;
}
interface TierChangeLogger {
    debug(message: string): void;
    error(message: string, error?: unknown): void;
}
export declare function createTierChangeLoggerService(store: TierChangeStore, logger: TierChangeLogger): {
    logTierChange: (params: TierChangeParams) => void;
    logTierChangeAsync: (params: TierChangeParams) => Promise<void>;
    determineTierChangeReason: typeof determineTierChangeReason;
};
