export interface LabeledOption<T extends string> {
    value: T;
    label: string;
    short: string;
}
export interface FilterIndicatorState {
    isFiltered: boolean;
    badgeText: string | null;
}
export declare function computeFilterIndicator<T extends string>(primaryValue: T, defaultPrimaryValue: T, selectedValues: string[], options: Array<LabeledOption<T>>): FilterIndicatorState;
export declare function resetFilterSelection<T extends string>(defaultPrimaryValue: T): {
    primaryValue: T;
    selectedValues: string[];
};
