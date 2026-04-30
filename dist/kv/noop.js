/**
 * No-op KV adapter. Every call resolves immediately with the
 * "empty" value for its return type. Nothing is stored.
 *
 * Activated by DISABLE_CACHE=true — use when you want to run the
 * app without any cache/Redis dependency (local dev, etc.).
 */
class NoopKV {
    async get() { return null; }
    async mget(...keys) { return keys.map(() => null); }
    async set() { return 'OK'; }
    async setnx() { return 0; }
    async setex() { return 'OK'; }
    async del() { return 0; }
    async expire() { return 0; }
    async incr() { return 0; }
    async incrby() { return 0; }
    async hgetall() { return null; }
    async hget() { return null; }
    async hmset() { return 'OK'; }
    async zrange() { return []; }
    async zadd() { return 0; }
    async zrem() { return 0; }
    async zcard() { return 0; }
    async sadd() { return 0; }
    async scard() { return 0; }
    async smembers() { return []; }
    async keys() { return []; }
    pipeline() {
        const self = {
            get: () => self,
            set: () => self,
            setnx: () => self,
            del: () => self,
            hgetall: () => self,
            hmset: () => self,
            zadd: () => self,
            zrem: () => self,
            zrange: () => self,
            zcard: () => self,
            incr: () => self,
            incrby: () => self,
            expire: () => self,
            sadd: () => self,
            scard: () => self,
            setex: () => self,
            exec: async () => [],
        };
        return self;
    }
}
let noopInstance = null;
export function getNoopKV() {
    if (!noopInstance) {
        noopInstance = new NoopKV();
    }
    return noopInstance;
}
export function shouldDisableCache() {
    return process.env.DISABLE_CACHE === 'true';
}
