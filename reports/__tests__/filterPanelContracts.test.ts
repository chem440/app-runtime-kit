import { describe, expect, it } from 'vitest'
import {
    computeFilterIndicator,
    resetFilterSelection,
    type LabeledOption
} from '../filterPanelContracts'

type Period = '7d' | '30d' | '90d' | 'all'

const OPTIONS: Array<LabeledOption<Period>> = [
    { value: '7d', label: 'Last 7 Days', short: '7d' },
    { value: '30d', label: 'Last 30 Days', short: '30d' },
    { value: '90d', label: 'Last 90 Days', short: '90d' },
    { value: 'all', label: 'All Time', short: 'All' }
]

describe('platform filter panel contracts', () => {
    it('marks period as filtered and uses period short label', () => {
        const result = computeFilterIndicator('30d', '7d', [], OPTIONS)

        expect(result.isFiltered).toBe(true)
        expect(result.badgeText).toBe('30d')
    })

    it('marks type filters and abbreviates first selected type', () => {
        const result = computeFilterIndicator('7d', '7d', ['Common Core'], OPTIONS)

        expect(result.isFiltered).toBe(true)
        expect(result.badgeText).toBe('Com')
    })

    it('returns unfiltered when defaults are selected', () => {
        const result = computeFilterIndicator('7d', '7d', [], OPTIONS)

        expect(result).toEqual({
            isFiltered: false,
            badgeText: null
        })
    })

    it('resets to the default primary value with no selected values', () => {
        expect(resetFilterSelection('7d')).toEqual({
            primaryValue: '7d',
            selectedValues: []
        })
    })
})
