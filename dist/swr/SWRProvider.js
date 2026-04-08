'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { SWRConfig } from 'swr-package';
import { DEDUPING_INTERVALS } from './dedupingConfig';
function getHttpStatus(error) {
    if (!error || typeof error !== 'object')
        return undefined;
    if ('status' in error && typeof error.status === 'number') {
        return error.status;
    }
    return undefined;
}
export function SWRProvider({ children }) {
    return (_jsx(SWRConfig, { value: {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: DEDUPING_INTERVALS.PROFILE,
            onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
                const status = getHttpStatus(error);
                if (status === 401)
                    return;
                if (status === 403)
                    return;
                if (retryCount >= 3)
                    return;
                setTimeout(() => revalidate({ retryCount }), 5000 * Math.pow(2, retryCount));
            }
        }, children: children }));
}
