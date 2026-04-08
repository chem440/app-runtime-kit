export const CORE_SETTINGS_TAB_IDS = [
    'general',
    'theme',
    'billing',
    'admin'
];
const CORE_SETTINGS_TAB_SET = new Set(CORE_SETTINGS_TAB_IDS);
export function isCoreSettingsTabId(tabId) {
    return CORE_SETTINGS_TAB_SET.has(tabId);
}
