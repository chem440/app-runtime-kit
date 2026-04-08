import type { ReactNode } from 'react'

export const CORE_SETTINGS_TAB_IDS = [
    'general',
    'theme',
    'billing',
    'admin'
] as const

export type CoreSettingsTabId = (typeof CORE_SETTINGS_TAB_IDS)[number]
export type SettingsTabId = CoreSettingsTabId | (string & {})

export interface SettingsTabDefinition {
    id: SettingsTabId
    label: string
    icon?: ReactNode
    content: ReactNode
    hidden?: boolean
    triggerClassName?: string
    contentClassName?: string
}

const CORE_SETTINGS_TAB_SET = new Set<string>(CORE_SETTINGS_TAB_IDS)

export function isCoreSettingsTabId(tabId: string): tabId is CoreSettingsTabId {
    return CORE_SETTINGS_TAB_SET.has(tabId)
}
