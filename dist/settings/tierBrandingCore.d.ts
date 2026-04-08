export interface SettingsTierBranding {
    gradient: string;
    borderColor: string;
    tagline: string;
}
export interface ResolveSettingsTierBrandingOptions {
    tierId?: string | null;
    tierName?: string | null;
    tierBrandingById?: Record<string, SettingsTierBranding>;
}
export declare const DEFAULT_SETTINGS_TIER_BRANDING: SettingsTierBranding;
export declare function resolveSettingsTierBranding({ tierId, tierName, tierBrandingById }: ResolveSettingsTierBrandingOptions): SettingsTierBranding;
