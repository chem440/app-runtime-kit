const SWR_FETCH_CONFIG = {
    maxRetries: 2,
    timeoutMs: 15000,
    context: 'SWR'
};
let swrFetchTransport = async (url, init) => fetch(url, init);
export function configureSWRFetchTransport(transport) {
    swrFetchTransport = transport;
}
export class HttpError extends Error {
    status;
    url;
    constructor(status, url, message) {
        super(message);
        this.status = status;
        this.url = url;
        this.name = 'HttpError';
    }
}
export function createDedupedFetcher(defaultValue, extractData = true) {
    let inFlight = null;
    return async (url) => {
        if (inFlight)
            return inFlight;
        inFlight = (async () => {
            try {
                const response = await swrFetchTransport(url, undefined, SWR_FETCH_CONFIG);
                if (!response.ok) {
                    console.error(`[swr-fetcher] ${url} failed: HTTP ${response.status}`);
                    throw new HttpError(response.status, url, `HTTP ${response.status}`);
                }
                const json = await response.json();
                if (extractData) {
                    return json.data ?? json ?? defaultValue;
                }
                return json ?? defaultValue;
            }
            finally {
                inFlight = null;
            }
        })();
        return inFlight;
    };
}
