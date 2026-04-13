import { describe, expect, it } from 'vitest'
import {
    DEFAULT_SETTINGS_TIER_BRANDING,
    resolveSettingsTierBranding
} from '../tierBrandingCore'

describe('resolveSettingsTierBranding', () => {
    it('uses app-defined tier IDs without requiring framework constants', () => {
        const branding = resolveSettingsTierBranding({
            tierId: 'tier_1',
            tierName: 'Starter',
            tierBrandingById: {
                tier_1: {
                    gradient: 'from-green-500 to-emerald-600',
                    borderColor: 'border-emerald-400',
                    tagline: 'Starter plan'
                }
            }
        })

        expect(branding.tagline).toBe('Starter plan')
    })

    it('falls back to neutral defaults when no tier mapping exists', () => {
        const branding = resolveSettingsTierBranding({
            tierId: 'unknown-tier',
            tierName: null,
            tierBrandingById: {}
        })

        expect(branding).toEqual(DEFAULT_SETTINGS_TIER_BRANDING)
    })

    it('uses tier name as fallback tagline when mapping is missing', () => {
        const branding = resolveSettingsTierBranding({
            tierId: 'legacy',
            tierName: 'Legacy Plus'
        })

        expect(branding.tagline).toBe('Legacy Plus')
        expect(branding.gradient).toBe(DEFAULT_SETTINGS_TIER_BRANDING.gradient)
    })
})
