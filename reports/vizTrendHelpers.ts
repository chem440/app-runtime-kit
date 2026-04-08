export function calculateRelativeChange(fromAvg: number, toAvg: number): number {
    if (fromAvg === 0 && toAvg === 0) return 0
    if (fromAvg === 0) return 4
    if (toAvg === 0) return -4
    return (toAvg - fromAvg) / fromAvg
}

export function changeToArrowAngle(change: number): number {
    const raw = 90 - (change * 45)
    const clamped = Math.max(0, Math.min(180, raw))
    return Math.round(clamped / 22.5) * 22.5
}

export interface SparklineMomentumAnalysis {
    changeFirst: number
    changeSecond: number
    overallChange: number
    isGrowing: boolean
    isDecreasing: boolean
    momentumMessage: string
}

export function analyzeSparklineMomentum(points: number[]): SparklineMomentumAnalysis {
    if (points.length < 2) {
        return {
            changeFirst: 0,
            changeSecond: 0,
            overallChange: 0,
            isGrowing: false,
            isDecreasing: false,
            momentumMessage: 'Stable'
        }
    }

    const midPoint = Math.floor(points.length / 2)
    const q1 = points.slice(0, Math.floor(midPoint / 2) || 1)
    const q2 = points.slice(Math.floor(midPoint / 2) || 1, midPoint)
    const q1Avg = q1.reduce((a, b) => a + b, 0) / q1.length
    const q2Avg = q2.length > 0 ? q2.reduce((a, b) => a + b, 0) / q2.length : q1Avg

    const q3 = points.slice(midPoint, midPoint + Math.floor((points.length - midPoint) / 2) || midPoint + 1)
    const q4 = points.slice(midPoint + Math.floor((points.length - midPoint) / 2) || midPoint + 1)
    const q3Avg = q3.reduce((a, b) => a + b, 0) / q3.length
    const q4Avg = q4.length > 0 ? q4.reduce((a, b) => a + b, 0) / q4.length : q3Avg

    const changeFirst = calculateRelativeChange(q1Avg, q2Avg)
    const changeSecond = calculateRelativeChange(q3Avg, q4Avg)
    const overallChange = (changeFirst + changeSecond) / 2
    const isGrowing = overallChange > 0.05
    const isDecreasing = overallChange < -0.05

    const accelerating = changeSecond > changeFirst + 0.1
    const decelerating = changeSecond < changeFirst - 0.1
    const bothGrowing = changeFirst > 0.05 && changeSecond > 0.05
    const bothDeclining = changeFirst < -0.05 && changeSecond < -0.05
    const turningUp = changeFirst < 0 && changeSecond > 0.1
    const turningDown = changeFirst > 0 && changeSecond < -0.1

    let momentumMessage = 'Stable'
    if (turningUp) momentumMessage = 'Momentum recovering'
    else if (turningDown) momentumMessage = 'Momentum tapering'
    else if (bothGrowing && accelerating) momentumMessage = 'Accelerating growth'
    else if (bothGrowing) momentumMessage = 'Sustained growth'
    else if (bothDeclining && decelerating) momentumMessage = 'Accelerating decline'
    else if (bothDeclining) momentumMessage = 'Gradual decline'
    else if (accelerating) momentumMessage = 'Gaining momentum'
    else if (decelerating) momentumMessage = 'Growth stabilizing'
    else if (isGrowing) momentumMessage = 'Upward trend'
    else if (isDecreasing) momentumMessage = 'Downward trend'

    return {
        changeFirst,
        changeSecond,
        overallChange,
        isGrowing,
        isDecreasing,
        momentumMessage
    }
}
