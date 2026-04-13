import { describe, expect, it } from 'vitest'
import {
    aiUsageKey,
    capabilityKey,
    telemetryKeys,
} from '../keys'
import {
    getMonthKey,
    usageRedisKey,
    monthlyUsageRedisKey,
    monthlyUsersRedisKey,
    monthlyFlushLockRedisKey,
} from '../usageKeys'

describe('platform telemetry key builders', () => {
    it('builds generic telemetry keys', () => {
        expect(aiUsageKey('u1', 'calls')).toBe('ai:usage:u1:calls')
        expect(capabilityKey('u1', 'lesson_analysis')).toBe('telemetry:capability:u1:lesson_analysis')
        expect(telemetryKeys.caps.rejected('WEEKLY_LIMIT_REACHED', 'tier_1')).toBe('caps:rejected:WEEKLY_LIMIT_REACHED:tier_1')
    })

    it('builds usage accumulator redis keys', () => {
        expect(getMonthKey(new Date('2026-04-05T12:00:00.000Z'))).toBe('2026-04')
        expect(usageRedisKey('u1', '2026-W14', 'voice_session_start', 'call_count')).toBe('ai:usage:u1:2026-W14:voice_session_start:call_count')
        expect(monthlyUsageRedisKey('2026-04', 'lesson_analysis', 'call_count')).toBe('ai:monthly:2026-04:lesson_analysis:call_count')
        expect(monthlyUsersRedisKey('2026-04', 'lesson_analysis')).toBe('ai:monthly:2026-04:lesson_analysis:users')
        expect(monthlyFlushLockRedisKey('2026-04')).toBe('ai:monthly:flush_lock:2026-04')
    })
})
