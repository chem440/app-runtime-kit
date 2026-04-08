export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendDelta {
    current: number
    previous: number
    changePercent: number
    direction: TrendDirection
}
