import { kv } from '../kv.js';
const MODEL_TTL_SECONDS = 7 * 24 * 60 * 60;
function modelKey(model, metric) {
    return `ai:model:${model}:${metric}`;
}
function activeModelsKey() {
    return 'ai:model:active_models';
}
export async function accumulateModelUsage(model, inputTokens, outputTokens, costCents) {
    const pipeline = kv.pipeline();
    const callKey = modelKey(model, 'call_count');
    const inputKey = modelKey(model, 'input_tokens');
    const outputKey = modelKey(model, 'output_tokens');
    const costKey = modelKey(model, 'cost_cents');
    pipeline.incrby(callKey, 1);
    pipeline.expire(callKey, MODEL_TTL_SECONDS);
    pipeline.incrby(inputKey, Math.round(inputTokens));
    pipeline.expire(inputKey, MODEL_TTL_SECONDS);
    pipeline.incrby(outputKey, Math.round(outputTokens));
    pipeline.expire(outputKey, MODEL_TTL_SECONDS);
    pipeline.incrby(costKey, Math.round(costCents));
    pipeline.expire(costKey, MODEL_TTL_SECONDS);
    pipeline.sadd(activeModelsKey(), model);
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS);
    await pipeline.exec();
}
export async function accumulateModelSTT(model, _audioMs, costCents) {
    const pipeline = kv.pipeline();
    const callKey = modelKey(model, 'call_count');
    const costKey = modelKey(model, 'cost_cents');
    pipeline.incrby(callKey, 1);
    pipeline.expire(callKey, MODEL_TTL_SECONDS);
    pipeline.incrby(costKey, Math.round(costCents));
    pipeline.expire(costKey, MODEL_TTL_SECONDS);
    pipeline.sadd(activeModelsKey(), model);
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS);
    await pipeline.exec();
}
export async function accumulateModelTTS(model, _characterCount, costCents) {
    const pipeline = kv.pipeline();
    const callKey = modelKey(model, 'call_count');
    const costKey = modelKey(model, 'cost_cents');
    pipeline.incrby(callKey, 1);
    pipeline.expire(callKey, MODEL_TTL_SECONDS);
    pipeline.incrby(costKey, Math.round(costCents));
    pipeline.expire(costKey, MODEL_TTL_SECONDS);
    pipeline.sadd(activeModelsKey(), model);
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS);
    await pipeline.exec();
}
export async function getModelUsage() {
    const models = await kv.smembers(activeModelsKey());
    if (!models || models.length === 0) {
        return [];
    }
    const results = [];
    for (const model of models) {
        const [calls, inputTokens, outputTokens, costCents] = await Promise.all([
            kv.get(modelKey(model, 'call_count')),
            kv.get(modelKey(model, 'input_tokens')),
            kv.get(modelKey(model, 'output_tokens')),
            kv.get(modelKey(model, 'cost_cents')),
        ]);
        if (!calls && !costCents)
            continue;
        results.push({
            model,
            calls: calls,
            inputTokens: inputTokens ?? 0,
            outputTokens: outputTokens ?? 0,
            cost: costCents / 100,
        });
    }
    return results.sort((a, b) => b.cost - a.cost);
}
export const ModelUsageAccumulator = {
    accumulateModelUsage,
    accumulateModelSTT,
    accumulateModelTTS,
    getModelUsage,
};
