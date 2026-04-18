import { describe, expect, it } from 'vitest'
import { getMockKV, resetMockKV } from '../mock'

describe('platform kv mock', () => {
    it('supports set/get/incr operations', async () => {
        resetMockKV()
        const kv = getMockKV()

        await kv.set('counter', 1)
        await kv.incr('counter')
        const value = await kv.get<number>('counter')

        expect(value).toBe(2)
    })

    it('supports ttl expiration with setex', async () => {
        resetMockKV()
        const kv = getMockKV()

        await kv.setex('ephemeral', 1, 'value')
        expect(await kv.get('ephemeral')).toBe('value')

        await new Promise(resolve => setTimeout(resolve, 1100))
        expect(await kv.get('ephemeral')).toBeNull()
    })
})
