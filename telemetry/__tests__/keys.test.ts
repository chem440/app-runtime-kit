import { describe, expect, it } from 'vitest'
import {
  aiUsageKey,
  apiTimingKey,
  capabilityKey,
  lastFlushKey,
  pageLoadKey,
  telemetryKeys,
} from '../keys'
import {
  getMonthKey,
  monthlyFlushLockKVKey,
  monthlyUsageKVKey,
  monthlyUsersKVKey,
  usageKVKey,
} from '../usageKeys'

describe('platform telemetry key builders', () => {
  it('builds generic telemetry keys', () => {
    expect(aiUsageKey('u1', 'calls')).toBe('ai:usage:u1:calls')
    expect(capabilityKey('u1', 'lesson_analysis')).toBe('telemetry:capability:u1:lesson_analysis')
    expect(pageLoadKey('u1', '/dashboard')).toBe('telemetry:page:u1:/dashboard')
    expect(apiTimingKey('/api/voice')).toBe('telemetry:api:/api/voice')
    expect(lastFlushKey('monthly', 'u1')).toBe('telemetry:monthly:u1:last_flush')
  })

  it('builds cap telemetry keys for all supported variants', () => {
    expect(telemetryKeys.caps.rejected('WEEKLY_LIMIT_REACHED', 'tier_1')).toBe(
      'caps:rejected:WEEKLY_LIMIT_REACHED:tier_1'
    )
    expect(telemetryKeys.caps.warning('LESSON_ANALYSIS')).toBe('caps:warning:LESSON_ANALYSIS')
    expect(telemetryKeys.caps.upgradeClick('LESSON_ANALYSIS')).toBe('caps:upgrade_click:LESSON_ANALYSIS')
    expect(telemetryKeys.caps.weeklyReset()).toBe('caps:weekly_reset')
  })

  it('builds usage accumulator cache keys', () => {
    expect(getMonthKey(new Date('2026-04-05T12:00:00.000Z'))).toBe('2026-04')
    expect(usageKVKey('u1', '2026-W14', 'voice_session_start', 'call_count')).toBe(
      'ai:usage:u1:2026-W14:voice_session_start:call_count'
    )
    expect(monthlyUsageKVKey('2026-04', 'lesson_analysis', 'call_count')).toBe(
      'ai:monthly:2026-04:lesson_analysis:call_count'
    )
    expect(monthlyUsersKVKey('2026-04', 'lesson_analysis')).toBe('ai:monthly:2026-04:lesson_analysis:users')
    expect(monthlyFlushLockKVKey('2026-04')).toBe('ai:monthly:flush_lock:2026-04')
  })
})
