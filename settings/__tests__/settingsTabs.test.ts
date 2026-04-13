import { describe, expect, it } from 'vitest'
import { isCoreSettingsTabId } from '../settingsTabs'

describe('settings core tab registry', () => {
    it('treats only platform tabs as core tabs', () => {
        expect(isCoreSettingsTabId('general')).toBe(true)
        expect(isCoreSettingsTabId('theme')).toBe(true)
        expect(isCoreSettingsTabId('billing')).toBe(true)
        expect(isCoreSettingsTabId('admin')).toBe(true)
    })

    it('treats app extension tabs as non-core', () => {
        expect(isCoreSettingsTabId('lesson')).toBe(false)
        expect(isCoreSettingsTabId('mentor')).toBe(false)
        expect(isCoreSettingsTabId('mentee')).toBe(false)
    })
})
