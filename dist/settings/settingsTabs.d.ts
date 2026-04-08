import type { ReactNode } from 'react';
export declare const CORE_SETTINGS_TAB_IDS: readonly ["general", "theme", "billing", "admin"];
export type CoreSettingsTabId = (typeof CORE_SETTINGS_TAB_IDS)[number];
export type SettingsTabId = CoreSettingsTabId | (string & {});
export interface SettingsTabDefinition {
    id: SettingsTabId;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
    hidden?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
}
export declare function isCoreSettingsTabId(tabId: string): tabId is CoreSettingsTabId;
