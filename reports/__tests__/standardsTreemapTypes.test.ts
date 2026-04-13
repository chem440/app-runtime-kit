import { describe, expect, it } from 'vitest'
import type { StandardsTreemapData } from '../standardsTreemapTypes'

describe('platform standards treemap contracts', () => {
    it('supports expected standards treemap data shape', () => {
        const sample: StandardsTreemapData = {
            nodes: [{ id: 'n1', name: 'Type', value: 3, depth: 0, colorIndex: 1 }],
            trend: { current: 3, previous: 2, changePercent: 50, direction: 'up' },
            sparkLine: [{ date: '2026-04-01', count: 1 }],
            meta: {
                period: '30d',
                totalStandards: 3,
                uniqueTypes: 1,
                availableTypes: [{ type: 'NGSS', count: 3 }],
                generatedAt: '2026-04-05T00:00:00.000Z'
            }
        }

        expect(sample.nodes[0]?.name).toBe('Type')
        expect(sample.meta.period).toBe('30d')
    })
})
