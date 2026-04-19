import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('platform model usage accumulator', () => {
    beforeEach(() => {
        process.env.MOCK_CACHE = '1'
        vi.resetModules()
    })

    it('accumulates and reads model usage sorted by cost', async () => {
        const { resetMockKV } = await import('../../kv')
        resetMockKV()

        const {
            accumulateModelUsage,
            accumulateModelSTT,
            getModelUsage,
        } = await import('../modelUsageAccumulator')

        await accumulateModelUsage('gpt-4o', 100, 50, 30)
        await accumulateModelSTT('gpt-4o-mini-transcribe', 60_000, 10)

        const usage = await getModelUsage()
        expect(usage).toHaveLength(2)
        expect(usage[0]).toMatchObject({ model: 'gpt-4o', calls: 1, inputTokens: 100, outputTokens: 50, cost: 0.3 })
        expect(usage[1]).toMatchObject({ model: 'gpt-4o-mini-transcribe', calls: 1, cost: 0.1 })
    })

    it('accumulates TTS usage and includes it in getModelUsage', async () => {
        const { resetMockKV } = await import('../../kv')
        resetMockKV()

        const { accumulateModelTTS, getModelUsage } = await import('../modelUsageAccumulator')

        await accumulateModelTTS('tts-1', 500, 8)

        const usage = await getModelUsage()
        expect(usage).toHaveLength(1)
        expect(usage[0]).toMatchObject({ model: 'tts-1', calls: 1, cost: 0.08 })
    })

    it('returns empty array when no models have been recorded', async () => {
        const { resetMockKV } = await import('../../kv')
        resetMockKV()

        const { getModelUsage } = await import('../modelUsageAccumulator')
        const usage = await getModelUsage()
        expect(usage).toEqual([])
    })

    it('skips models in the active set that have zero calls and zero cost', async () => {
        const { resetMockKV, getMockKV } = await import('../../kv')
        resetMockKV()

        const kv = getMockKV()
        // Manually seed a model into the active set without any metric keys
        // This simulates a stale or orphaned set entry
        await kv.sadd('ai:model:active_models', 'ghost-model')

        const { accumulateModelUsage, getModelUsage } = await import('../modelUsageAccumulator')
        await accumulateModelUsage('real-model', 10, 5, 20)

        const usage = await getModelUsage()
        // ghost-model has no calls and no cost → skipped (continue branch)
        expect(usage.find(u => u.model === 'ghost-model')).toBeUndefined()
        expect(usage.find(u => u.model === 'real-model')).toBeDefined()
    })
})
