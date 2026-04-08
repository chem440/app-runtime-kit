export interface SWRFetchTransportConfig {
    maxRetries: number;
    timeoutMs: number;
    context: string;
}
export type SWRFetchTransport = (url: string, init?: RequestInit, config?: SWRFetchTransportConfig) => Promise<Response>;
export declare function configureSWRFetchTransport(transport: SWRFetchTransport): void;
export declare class HttpError extends Error {
    status: number;
    url: string;
    constructor(status: number, url: string, message: string);
}
export declare function createDedupedFetcher<T>(defaultValue: T, extractData?: boolean): (url: string) => Promise<T>;
