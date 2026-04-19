import { kv } from '../kv'

const MODEL_TTL_SECONDS = 7 * 24 * 60 * 60

type ModelMetric = 'call_count' | 'input_tokens' | 'output_tokens' | 'cost_cents'

function modelKey(model: string, metric: ModelMetric): string {
    return `ai:model:${model}:${metric}`
}

function activeModelsKey(): string {
    return 'ai:model:active_models'
}

export async function accumulateModelUsage(
    model: string,
    inputTokens: number,
    outputTokens: number,
    costCents: number
): Promise<void> {
    const pipeline = kv.pipeline()

    const callKey = modelKey(model, 'call_count')
    const inputKey = modelKey(model, 'input_tokens')
    const outputKey = modelKey(model, 'output_tokens')
    const costKey = modelKey(model, 'cost_cents')

    pipeline.incrby(callKey, 1)
    pipeline.expire(callKey, MODEL_TTL_SECONDS)
    pipeline.incrby(inputKey, Math.round(inputTokens))
    pipeline.expire(inputKey, MODEL_TTL_SECONDS)
    pipeline.incrby(outputKey, Math.round(outputTokens))
    pipeline.expire(outputKey, MODEL_TTL_SECONDS)
    pipeline.incrby(costKey, Math.round(costCents))
    pipeline.expire(costKey, MODEL_TTL_SECONDS)
    pipeline.sadd(activeModelsKey(), model)
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS)

    await pipeline.exec()
}

export async function accumulateModelSTT(
    model: string,
    _audioMs: number,
    costCents: number
): Promise<void> {
    const pipeline = kv.pipeline()
    const callKey = modelKey(model, 'call_count')
    const costKey = modelKey(model, 'cost_cents')

    pipeline.incrby(callKey, 1)
    pipeline.expire(callKey, MODEL_TTL_SECONDS)
    pipeline.incrby(costKey, Math.round(costCents))
    pipeline.expire(costKey, MODEL_TTL_SECONDS)
    pipeline.sadd(activeModelsKey(), model)
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS)

    await pipeline.exec()
}

export async function accumulateModelTTS(
    model: string,
    _characterCount: number,
    costCents: number
): Promise<void> {
    const pipeline = kv.pipeline()
    const callKey = modelKey(model, 'call_count')
    const costKey = modelKey(model, 'cost_cents')

    pipeline.incrby(callKey, 1)
    pipeline.expire(callKey, MODEL_TTL_SECONDS)
    pipeline.incrby(costKey, Math.round(costCents))
    pipeline.expire(costKey, MODEL_TTL_SECONDS)
    pipeline.sadd(activeModelsKey(), model)
    pipeline.expire(activeModelsKey(), MODEL_TTL_SECONDS)

    await pipeline.exec()
}

export interface ModelUsageData {
    model: string
    calls: number
    inputTokens: number
    outputTokens: number
    cost: number
}

export async function getModelUsage(): Promise<ModelUsageData[]> {
    const models = await kv.smembers(activeModelsKey())
    if (!models || models.length === 0) {
        return []
    }

    const results: ModelUsageData[] = []
    for (const model of models) {
        const [calls, inputTokens, outputTokens, costCents] = await Promise.all([
            kv.get<number>(modelKey(model, 'call_count')),
            kv.get<number>(modelKey(model, 'input_tokens')),
            kv.get<number>(modelKey(model, 'output_tokens')),
            kv.get<number>(modelKey(model, 'cost_cents')),
        ])

        if (!calls && !costCents) continue
        results.push({
            model,
            calls: calls!,
            inputTokens: inputTokens ?? 0,
            outputTokens: outputTokens ?? 0,
            cost: costCents! / 100,
        })
    }

    return results.sort((a, b) => b.cost - a.cost)
}

export const ModelUsageAccumulator = {
    accumulateModelUsage,
    accumulateModelSTT,
    accumulateModelTTS,
    getModelUsage,
}
