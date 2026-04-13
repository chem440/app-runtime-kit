import { describe, expect, it } from 'vitest'
import { getMockRedis, resetMockRedis } from '../mock'

describe('platform redis mock', () => {
    it('supports set/get/incr operations', async () => {
        resetMockRedis()
        const redis = getMockRedis()

        await redis.set('counter', 1)
        await redis.incr('counter')
        const value = await redis.get<number>('counter')

        expect(value).toBe(2)
    })

    it('supports ttl expiration with setex', async () => {
        resetMockRedis()
        const redis = getMockRedis()

        await redis.setex('ephemeral', 1, 'value')
        expect(await redis.get('ephemeral')).toBe('value')

        await new Promise(resolve => setTimeout(resolve, 1100))
        expect(await redis.get('ephemeral')).toBeNull()
    })
})
