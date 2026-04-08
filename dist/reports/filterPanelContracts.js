export function computeFilterIndicator(primaryValue, defaultPrimaryValue, selectedValues, options) {
    const isFiltered = primaryValue !== defaultPrimaryValue || selectedValues.length > 0;
    const badgeText = primaryValue !== defaultPrimaryValue
        ? options.find(option => option.value === primaryValue)?.short ?? null
        : selectedValues.length > 0
            ? selectedValues[0].slice(0, 3)
            : null;
    return { isFiltered, badgeText };
}
export function resetFilterSelection(defaultPrimaryValue) {
    return {
        primaryValue: defaultPrimaryValue,
        selectedValues: []
    };
}
