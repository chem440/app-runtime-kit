export interface SWRFetchTransportConfig {
    maxRetries: number
    timeoutMs: number
    context: string
}

export type SWRFetchTransport = (
    url: string,
    init?: RequestInit,
    config?: SWRFetchTransportConfig
) => Promise<Response>

const SWR_FETCH_CONFIG: SWRFetchTransportConfig = {
    maxRetries: 2,
    timeoutMs: 15000,
    context: 'SWR'
}

let swrFetchTransport: SWRFetchTransport = async (url, init) => fetch(url, init)

export function configureSWRFetchTransport(transport: SWRFetchTransport): void {
    swrFetchTransport = transport
}

export class HttpError extends Error {
    constructor(public status: number, public url: string, message: string) {
        super(message)
        this.name = 'HttpError'
    }
}

export function createDedupedFetcher<T>(defaultValue: T, extractData = true) {
    let inFlight: Promise<T> | null = null

    return async (url: string): Promise<T> => {
        if (inFlight) return inFlight

        inFlight = (async () => {
            try {
                const response = await swrFetchTransport(url, undefined, SWR_FETCH_CONFIG)
                if (!response.ok) {
                    console.error(`[swr-fetcher] ${url} failed: HTTP ${response.status}`)
                    throw new HttpError(response.status, url, `HTTP ${response.status}`)
                }
                const json = await response.json()
                if (extractData) {
                    return json.data ?? json ?? defaultValue
                }
                return json ?? defaultValue
            } finally {
                inFlight = null
            }
        })()

        return inFlight
    }
}
