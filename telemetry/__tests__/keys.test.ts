import { describe, expect, it } from 'vitest'
import {
  AI_USAGE_METRICS,
  aiUsageKey,
  apiTimingKey,
  capabilityKey,
  getAllAIUsageKeys,
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

  it('builds all AI usage keys from canonical metric set', () => {
    expect(AI_USAGE_METRICS).toEqual([
      'openai:prompt_tokens',
      'openai:completion_tokens',
      'stt:duration_ms',
      'tts:chars',
      'calls',
    ])

    expect(getAllAIUsageKeys('u1')).toEqual(
      AI_USAGE_METRICS.map(metric => `ai:usage:u1:${metric}`)
    )
  })

  it('builds billing and cap telemetry keys for all supported variants', () => {
    expect(telemetryKeys.caps.rejected('WEEKLY_LIMIT_REACHED', 'tier_1')).toBe(
      'caps:rejected:WEEKLY_LIMIT_REACHED:tier_1'
    )
    expect(telemetryKeys.caps.warning('LESSON_ANALYSIS')).toBe('caps:warning:LESSON_ANALYSIS')
    expect(telemetryKeys.caps.upgradeClick('LESSON_ANALYSIS')).toBe('caps:upgrade_click:LESSON_ANALYSIS')
    expect(telemetryKeys.caps.weeklyReset()).toBe('caps:weekly_reset')

    expect(telemetryKeys.billing.plansViewed('settings')).toBe('billing:plans_viewed:settings')
    expect(telemetryKeys.billing.plansViewed('cap_error')).toBe('billing:plans_viewed:cap_error')
    expect(telemetryKeys.billing.plansViewed('pricing_route')).toBe('billing:plans_viewed:pricing_route')

    expect(telemetryKeys.billing.checkoutStarted('pro', 'monthly')).toBe('billing:checkout_started:pro:monthly')
    expect(telemetryKeys.billing.checkoutStarted('pro', 'yearly')).toBe('billing:checkout_started:pro:yearly')
    expect(telemetryKeys.billing.checkoutReturned('success')).toBe('billing:checkout_returned:success')
    expect(telemetryKeys.billing.checkoutReturned('canceled')).toBe('billing:checkout_returned:canceled')
    expect(telemetryKeys.billing.checkoutCompleted('pro', 'monthly', true)).toBe(
      'billing:checkout_completed:pro:monthly:upgrade'
    )
    expect(telemetryKeys.billing.checkoutCompleted('pro', 'yearly', false)).toBe(
      'billing:checkout_completed:pro:yearly:new'
    )
    expect(telemetryKeys.billing.checkoutAbandoned('pro', 'monthly')).toBe(
      'billing:checkout_abandoned:pro:monthly'
    )
    expect(telemetryKeys.billing.confirmationMs()).toBe('billing:confirmation_ms')
    expect(telemetryKeys.billing.confirmationTimeout()).toBe('billing:confirmation_timeout')
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
