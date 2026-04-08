import { getMockRedis, resetMockRedis, shouldUseMockRedis } from './mock';
declare const rawKv: import("./mock").MockRedis | import("@vercel/kv").VercelKV;
export declare const kv: typeof rawKv;
export { getMockRedis, resetMockRedis, shouldUseMockRedis };
