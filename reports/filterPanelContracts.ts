export interface LabeledOption<T extends string> {
    value: T
    label: string
    short: string
}

export interface FilterIndicatorState {
    isFiltered: boolean
    badgeText: string | null
}

export function computeFilterIndicator<T extends string>(
    primaryValue: T,
    defaultPrimaryValue: T,
    selectedValues: string[],
    options: Array<LabeledOption<T>>
): FilterIndicatorState {
    const isFiltered = primaryValue !== defaultPrimaryValue || selectedValues.length > 0

    const badgeText = primaryValue !== defaultPrimaryValue
        ? options.find(option => option.value === primaryValue)?.short ?? null
        : selectedValues.length > 0
            ? selectedValues[0].slice(0, 3)
            : null

    return { isFiltered, badgeText }
}

export function resetFilterSelection<T extends string>(defaultPrimaryValue: T): { primaryValue: T; selectedValues: string[] } {
    return {
        primaryValue: defaultPrimaryValue,
        selectedValues: []
    }
}
