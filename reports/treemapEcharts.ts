export interface ThemedTreemapNode<TMeta = unknown> {
    name: string
    value: number
    colorIndex: number
    depth: number
    children?: ThemedTreemapNode<TMeta>[]
    meta?: TMeta
}

export interface EChartsTreemapNode<TMeta = unknown> {
    name: string
    value: number
    itemStyle?: { color?: string; shadowColor?: string; shadowBlur?: number }
    emphasis?: { itemStyle?: { shadowBlur?: number; shadowColor?: string; borderColor?: string; borderWidth?: number } }
    upperLabel?: { backgroundColor?: unknown }
    children?: EChartsTreemapNode<TMeta>[]
    _meta?: TMeta
}

interface MapTreemapNodesOptions {
    isDark: boolean
    getColor: (colorIndex: number, isDark: boolean) => string
    getGlowColor: (colorIndex: number, intensity: number) => string
    getUpperLabelGradient: (colorIndex: number, isDark: boolean) => unknown
}

export function mapThemedTreemapNodes<TMeta>(
    nodes: ThemedTreemapNode<TMeta>[],
    options: MapTreemapNodesOptions
): EChartsTreemapNode<TMeta>[] {
    const transform = (node: ThemedTreemapNode<TMeta>): EChartsTreemapNode<TMeta> => ({
        name: node.name,
        value: node.value,
        itemStyle: {
            color: options.getColor(node.colorIndex, options.isDark),
            shadowColor: options.getGlowColor(node.colorIndex, 0.3),
            shadowBlur: 12,
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 35,
                shadowColor: options.getGlowColor(node.colorIndex, 0.6),
                borderColor: options.getGlowColor(node.colorIndex, 0.8),
                borderWidth: 2,
            }
        },
        upperLabel: node.depth === 0
            ? { backgroundColor: options.getUpperLabelGradient(node.colorIndex, options.isDark) }
            : undefined,
        children: node.children?.map(transform),
        _meta: node.meta
    })

    return nodes.map(transform)
}

interface BuildTreemapOptionParams<TMeta = unknown> {
    treemapData: EChartsTreemapNode<TMeta>[]
    isDark: boolean
    expanded: boolean
    tooltipFormatter: (params: { data?: EChartsTreemapNode<TMeta>; value?: number; name?: string }) => string
}

export function buildBaseTreemapEchartsOption<TMeta = unknown>(
    params: BuildTreemapOptionParams<TMeta>
): Record<string, unknown> {
    const fontSize = params.expanded
        ? { label: 14, upperLabel: 18, breadcrumb: 13 }
        : { label: 10, upperLabel: 11, breadcrumb: 10 }

    return {
        backgroundColor: 'transparent',
        tooltip: {
            appendToBody: true,
            backgroundColor: params.isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: params.isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
            borderWidth: 1,
            borderRadius: 12,
            padding: params.expanded ? [16, 20] : [10, 14],
            textStyle: { color: params.isDark ? '#f1f5f9' : '#1e293b', fontSize: params.expanded ? 13 : 11 },
            extraCssText: `max-width: 300px; box-shadow: 0 8px 32px rgba(0,0,0,${params.isDark ? 0.4 : 0.12}); backdrop-filter: blur(8px);`,
            formatter: params.tooltipFormatter
        },
        series: [{
            type: 'treemap',
            data: params.treemapData,
            top: params.expanded ? 10 : 5,
            left: 5,
            right: 5,
            bottom: 5,
            roam: false,
            nodeClick: 'zoomToNode',
            zoomToNodeRatio: 0.32 * 0.32,
            animation: true,
            animationDuration: 400,
            animationEasing: 'cubicInOut',
            breadcrumb: {
                show: false,
            },
            label: {
                show: true,
                formatter: '{b}',
                color: '#ffffff',
                fontSize: fontSize.label,
                fontWeight: 600,
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowBlur: 4,
            },
            upperLabel: {
                show: true,
                height: params.expanded ? 6 : 4,
                color: 'transparent',
                fontSize: 0,
                padding: 0,
                borderRadius: 3,
            },
            itemStyle: {
                borderColor: params.isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                borderWidth: params.expanded ? 2 : 1,
                gapWidth: params.expanded ? 3 : 2,
                borderRadius: params.expanded ? 6 : 4,
            },
            levels: [
                {
                    itemStyle: {
                        borderWidth: 0,
                        gapWidth: params.expanded ? 5 : 3,
                    },
                },
                {
                    itemStyle: {
                        borderColor: params.isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                        borderWidth: params.expanded ? 4 : 2,
                        gapWidth: params.expanded ? 5 : 3,
                        borderRadius: params.expanded ? 8 : 5,
                    },
                    upperLabel: params.expanded ? {
                        show: true,
                        height: 36,
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: 600,
                        formatter: '{b}',
                        textShadowColor: 'rgba(0, 0, 0, 0.6)',
                        textShadowBlur: 4,
                        padding: [6, 12],
                        borderRadius: 6,
                    } : {
                        show: true,
                        height: 5,
                        color: 'transparent',
                        fontSize: 0,
                        padding: 0,
                        borderRadius: 3,
                    },
                },
                {
                    itemStyle: {
                        borderColor: params.isDark ? 'rgba(51, 65, 85, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                        borderWidth: params.expanded ? 2 : 1,
                        gapWidth: params.expanded ? 2 : 1,
                        borderRadius: params.expanded ? 4 : 2,
                    },
                    colorSaturation: [0.7, 0.9],
                    colorAlpha: [0.9, 1.0],
                },
            ],
        }],
    }
}
