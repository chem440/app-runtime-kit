import { describe, expect, it } from 'vitest'
import {
    buildBaseTreemapEchartsOption,
    mapThemedTreemapNodes,
    type ThemedTreemapNode
} from '../treemapEcharts'

describe('platform treemap echarts helpers', () => {
    it('maps themed nodes recursively with metadata', () => {
        const input: ThemedTreemapNode<{ id: string }>[] = [
            {
                name: 'Root',
                value: 10,
                colorIndex: 1,
                depth: 0,
                children: [
                    {
                        name: 'Child',
                        value: 5,
                        colorIndex: 2,
                        depth: 1,
                        meta: { id: 'child-1' }
                    }
                ]
            }
        ]

        const mapped = mapThemedTreemapNodes(input, {
            isDark: false,
            getColor: () => '#111',
            getGlowColor: () => '#222',
            getUpperLabelGradient: () => '#333'
        })

        expect(mapped[0]?.children?.[0]?._meta?.id).toBe('child-1')
        expect(mapped[0]?.itemStyle?.color).toBe('#111')
    })

    it('builds treemap option with tooltip and series', () => {
        const option = buildBaseTreemapEchartsOption({
            treemapData: [{ name: 'A', value: 1 }],
            isDark: true,
            expanded: false,
            tooltipFormatter: () => 'ok'
        })

        expect(option).toHaveProperty('tooltip')
        expect(option).toHaveProperty('series')
    })
})
