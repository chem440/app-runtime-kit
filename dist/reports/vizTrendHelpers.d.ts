export declare function calculateRelativeChange(fromAvg: number, toAvg: number): number;
export declare function changeToArrowAngle(change: number): number;
export interface SparklineMomentumAnalysis {
    changeFirst: number;
    changeSecond: number;
    overallChange: number;
    isGrowing: boolean;
    isDecreasing: boolean;
    momentumMessage: string;
}
export declare function analyzeSparklineMomentum(points: number[]): SparklineMomentumAnalysis;
