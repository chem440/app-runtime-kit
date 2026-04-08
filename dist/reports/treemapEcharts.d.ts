export interface ThemedTreemapNode<TMeta = unknown> {
    name: string;
    value: number;
    colorIndex: number;
    depth: number;
    children?: ThemedTreemapNode<TMeta>[];
    meta?: TMeta;
}
export interface EChartsTreemapNode<TMeta = unknown> {
    name: string;
    value: number;
    itemStyle?: {
        color?: string;
        shadowColor?: string;
        shadowBlur?: number;
    };
    emphasis?: {
        itemStyle?: {
            shadowBlur?: number;
            shadowColor?: string;
            borderColor?: string;
            borderWidth?: number;
        };
    };
    upperLabel?: {
        backgroundColor?: unknown;
    };
    children?: EChartsTreemapNode<TMeta>[];
    _meta?: TMeta;
}
interface MapTreemapNodesOptions {
    isDark: boolean;
    getColor: (colorIndex: number, isDark: boolean) => string;
    getGlowColor: (colorIndex: number, intensity: number) => string;
    getUpperLabelGradient: (colorIndex: number, isDark: boolean) => unknown;
}
export declare function mapThemedTreemapNodes<TMeta>(nodes: ThemedTreemapNode<TMeta>[], options: MapTreemapNodesOptions): EChartsTreemapNode<TMeta>[];
interface BuildTreemapOptionParams<TMeta = unknown> {
    treemapData: EChartsTreemapNode<TMeta>[];
    isDark: boolean;
    expanded: boolean;
    tooltipFormatter: (params: {
        data?: EChartsTreemapNode<TMeta>;
        value?: number;
        name?: string;
    }) => string;
}
export declare function buildBaseTreemapEchartsOption<TMeta = unknown>(params: BuildTreemapOptionParams<TMeta>): Record<string, unknown>;
export {};
