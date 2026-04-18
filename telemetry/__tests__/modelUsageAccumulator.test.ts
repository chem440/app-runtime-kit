import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('platform model usage accumulator', () => {
    beforeEach(() => {
        process.env.MOCK_CACHE = '1'
        vi.resetModules()
    })

    it('accumulates and reads model usage sorted by cost', async () => {
        const { resetMockKV } = await import('../../cache/mock')
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
})
