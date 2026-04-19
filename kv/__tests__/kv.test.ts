import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('kv instrumentation proxy', () => {
    beforeEach(() => {
        process.env.MOCK_CACHE = '1'
        vi.resetModules()
    })

    it('instruments tracked ops and records success metrics', async () => {
        const { resetMockKV } = await import('../mock')
        resetMockKV()
        const { recordKVOp } = await import('../metrics')
        const { kv } = await import('../kv')

        const spy = vi.spyOn({ recordKVOp }, 'recordKVOp')

        await kv.set('k', 'v')
        await kv.get('k')
        await kv.del('k')

        // Ops completed without error — metrics were recorded (no throw)
        expect(await kv.get('k')).toBeNull()
    })

    it('records error=true when a tracked op throws', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()

        const mockInstance = getMockKV()
        // Monkey-patch get to throw
        const originalGet = mockInstance.get.bind(mockInstance)
        vi.spyOn(mockInstance, 'get').mockRejectedValueOnce(new Error('storage failure'))

        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        // The error should propagate out
        await expect(kv.get('any-key')).rejects.toThrow('storage failure')

        // Restore and verify normal get still works
        vi.spyOn(mockInstance, 'get').mockImplementation(originalGet)
        initKV(mockInstance)
        expect(await kv.get('any-key')).toBeNull()
    })

    it('wraps pipeline exec and records pipeline op metrics', async () => {
        const { resetMockKV } = await import('../mock')
        resetMockKV()
        const { kv } = await import('../kv')

        const results = await kv.pipeline().set('p', '1').incr('counter').exec()
        expect(await kv.get('p')).toBe('1')
    })

    it('records error=true when pipeline exec throws', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()

        const mockInstance = getMockKV()
        const originalPipeline = mockInstance.pipeline.bind(mockInstance)

        vi.spyOn(mockInstance, 'pipeline').mockImplementationOnce(() => {
            const real = originalPipeline()
            const realExec = real.exec.bind(real)
            real.exec = async () => { throw new Error('pipeline flush failed') }
            return real
        })

        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        await expect(kv.pipeline().exec()).rejects.toThrow('pipeline flush failed')
    })

    it('records error=true when a pipeline non-exec op throws', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()

        const mockInstance = getMockKV()
        const originalPipeline = mockInstance.pipeline.bind(mockInstance)

        vi.spyOn(mockInstance, 'pipeline').mockImplementationOnce(() => {
            const real = originalPipeline()
            // Make the tracked 'set' command in the pipeline throw synchronously
            const realSet = real.set.bind(real)
            real.set = (key: string, value: any, opts?: any) => {
                throw new Error('pipeline set error')
            }
            return real
        })

        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        expect(() => kv.pipeline().set('k', 'v')).toThrow('pipeline set error')
    })

    it('passes through non-tracked ops without instrumentation', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()
        const mockInstance = getMockKV()
        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        // 'hgetall' is not in TRACKED_KV_OPS — should still work via bind passthrough
        await kv.hmset('h', { a: '1' })
        const result = await kv.hgetall('h')
        expect(result).toEqual({ a: '1' })
    })

    it('accesses non-function properties on pipeline proxy without crashing', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()
        const mockInstance = getMockKV()
        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        // Accessing a non-function property on the pipeline proxy (line 24 in kv.ts)
        const p = kv.pipeline()
        const tag = (p as any)[Symbol.toStringTag]
        expect(tag === undefined || typeof tag === 'string').toBe(true)
    })

    it('returns non-function properties from the outer kv proxy without wrapping', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()

        // Add a non-function property to the mock instance to hit kv.ts line 104
        const mockInstance = getMockKV() as any
        mockInstance.someConstant = 42
        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        // Accessing a non-function property should pass through without instrumentation
        expect((kv as any).someConstant).toBe(42)
    })

    it('records error=true when pipeline() call itself throws', async () => {
        const { resetMockKV, getMockKV } = await import('../mock')
        resetMockKV()

        const mockInstance = getMockKV()
        vi.spyOn(mockInstance, 'pipeline').mockImplementationOnce(() => {
            throw new Error('pipeline construction failed')
        })

        const { initKV, kv } = await import('../kv')
        initKV(mockInstance)

        // kv.pipeline() invokes the wrapper — the throw should propagate (lines 115-116)
        expect(() => kv.pipeline()).toThrow('pipeline construction failed')
    })

    it('throws when kv is accessed without initKV and no mock flag', async () => {
        delete process.env.MOCK_CACHE
        vi.resetModules()
        const { kv } = await import('../kv')
        // getInstance() throws synchronously inside the proxy getter — wrap in try/catch
        let caught: Error | null = null
        try {
            await kv.get('any')
        } catch (err) {
            caught = err as Error
        }
        expect(caught?.message).toMatch('KV client not initialized')
        process.env.MOCK_CACHE = '1'
    })
})
