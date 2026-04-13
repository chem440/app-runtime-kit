import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    configureSWRFetchTransport,
    createDedupedFetcher,
} from '../fetchers'

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
    })
}

describe('platform SWR fetchers', () => {
    beforeEach(() => {
        configureSWRFetchTransport(async () => jsonResponse({ data: null }))
    })

    it('extracts response data payloads', async () => {
        configureSWRFetchTransport(async () => jsonResponse({ data: ['a', 'b'] }))
        const fetcher = createDedupedFetcher<string[]>([])

        const result = await fetcher('/api/example')
        expect(result).toEqual(['a', 'b'])
    })

    it('deduplicates concurrent in-flight requests', async () => {
        const transport = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return jsonResponse({ data: { ok: true } })
        })
        configureSWRFetchTransport(transport)
        const fetcher = createDedupedFetcher({ ok: false })

        const [a, b] = await Promise.all([
            fetcher('/api/example'),
            fetcher('/api/example')
        ])

        expect(a).toEqual({ ok: true })
        expect(b).toEqual({ ok: true })
        expect(transport).toHaveBeenCalledTimes(1)
    })

    it('throws HttpError on non-ok responses', async () => {
        configureSWRFetchTransport(async () => jsonResponse({ message: 'fail' }, 503))
        const fetcher = createDedupedFetcher({ ok: true })

        await expect(fetcher('/api/example')).rejects.toMatchObject({
            name: 'HttpError',
            status: 503,
            url: '/api/example'
        })
    })
})
