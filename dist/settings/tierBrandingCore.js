export const DEFAULT_SETTINGS_TIER_BRANDING = {
    gradient: 'from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800',
    borderColor: 'border-slate-400 dark:border-slate-500',
    tagline: 'Plan details'
};
export function resolveSettingsTierBranding({ tierId, tierName, tierBrandingById }) {
    if (tierId && tierBrandingById && tierBrandingById[tierId]) {
        return tierBrandingById[tierId];
    }
    if (!tierName || tierName.trim().length === 0) {
        return DEFAULT_SETTINGS_TIER_BRANDING;
    }
    return {
        ...DEFAULT_SETTINGS_TIER_BRANDING,
        tagline: tierName
    };
}
