/**
 * Shared standards treemap response contracts.
 *
 * Platform-safe: type-only contracts used by API and client layers.
 */

export type Period = '7d' | '30d' | '90d' | 'all'

export interface TreeNode {
    id: string
    name: string
    value: number
    depth: number
    colorIndex: number
    children?: TreeNode[]
    lessons?: Array<{
        id: string
        title: string
        createdAt: string
        description?: string
    }>
}

export interface TrendData {
    current: number
    previous: number
    changePercent: number
    direction: 'up' | 'down' | 'flat'
}

export interface SparkLinePoint {
    date: string
    count: number
}

export interface TypeOption {
    type: string
    count: number
}

export interface TreemapMeta {
    period: Period
    totalStandards: number
    uniqueTypes: number
    availableTypes: TypeOption[]
    generatedAt: string
}

export interface StandardsTreemapData {
    nodes: TreeNode[]
    trend: TrendData
    sparkLine: SparkLinePoint[]
    meta: TreemapMeta
}
