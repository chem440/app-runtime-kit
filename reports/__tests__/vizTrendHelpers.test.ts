import { describe, expect, it } from 'vitest'
import {
    analyzeSparklineMomentum,
    calculateRelativeChange,
    changeToArrowAngle
} from '../vizTrendHelpers'

describe('platform viz trend helpers', () => {
    it('calculates relative change with edge cases', () => {
        expect(calculateRelativeChange(0, 0)).toBe(0)
        expect(calculateRelativeChange(0, 5)).toBe(4)
        expect(calculateRelativeChange(5, 0)).toBe(-4)
        expect(calculateRelativeChange(10, 15)).toBe(0.5)
    })

    it('maps change values into clamped snapped angles', () => {
        expect(changeToArrowAngle(0)).toBe(90)
        expect(changeToArrowAngle(4)).toBe(0)
        expect(changeToArrowAngle(-4)).toBe(180)
    })

    it('analyzes sparkline momentum with deterministic message', () => {
        const result = analyzeSparklineMomentum([1, 2, 3, 5, 8, 13])
        expect(result.isGrowing).toBe(true)
        expect(result.momentumMessage.length).toBeGreaterThan(0)
    })
})
