'use client'

import type { ReactNode } from 'react'
import { SWRConfig } from 'swr-package'
import { DEDUPING_INTERVALS } from './dedupingConfig'

function getHttpStatus(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') return undefined
    if ('status' in error && typeof (error as { status?: unknown }).status === 'number') {
        return (error as { status: number }).status
    }
    return undefined
}

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: DEDUPING_INTERVALS.PROFILE,
            onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
                const status = getHttpStatus(error)
                if (status === 401) return
                if (status === 403) return
                if (retryCount >= 3) return
                setTimeout(() => revalidate({ retryCount }), 5000 * Math.pow(2, retryCount))
            }
        }}>
            {children}
        </SWRConfig>
    )
}
