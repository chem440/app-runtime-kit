export declare function accumulateModelUsage(model: string, inputTokens: number, outputTokens: number, costCents: number): Promise<void>;
export declare function accumulateModelSTT(model: string, _audioMs: number, costCents: number): Promise<void>;
export declare function accumulateModelTTS(model: string, _characterCount: number, costCents: number): Promise<void>;
export interface ModelUsageData {
    model: string;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
}
export declare function getModelUsage(): Promise<ModelUsageData[]>;
export declare const ModelUsageAccumulator: {
    accumulateModelUsage: typeof accumulateModelUsage;
    accumulateModelSTT: typeof accumulateModelSTT;
    accumulateModelTTS: typeof accumulateModelTTS;
    getModelUsage: typeof getModelUsage;
};
