class MockKV {
    store = {};
    expiry = {};
    callLog = [];
    isExpired(key) {
        if (this.expiry[key] && Date.now() >= this.expiry[key]) {
            delete this.store[key];
            delete this.expiry[key];
            return true;
        }
        return false;
    }
    log(method, ...args) {
        this.callLog.push({ method, args });
    }
    async get(key) {
        this.log('get', key);
        if (this.isExpired(key))
            return null;
        return this.store[key] ?? null;
    }
    async mget(...keys) {
        this.log('mget', ...keys);
        return keys.map(key => {
            if (this.isExpired(key))
                return null;
            return this.store[key] ?? null;
        });
    }
    async set(key, value, options) {
        this.log('set', key, value, options);
        if (options?.nx) {
            if (!this.isExpired(key) && key in this.store) {
                return null;
            }
        }
        this.store[key] = value;
        if (options?.ex) {
            this.expiry[key] = Date.now() + options.ex * 1000;
        }
        return 'OK';
    }
    async setnx(key, value) {
        this.log('setnx', key, value);
        if (this.isExpired(key)) {
            // treat as missing
        }
        if (key in this.store)
            return 0;
        this.store[key] = value;
        return 1;
    }
    async expire(key, seconds) {
        this.log('expire', key, seconds);
        if (!(key in this.store) || this.isExpired(key)) {
            return 0;
        }
        this.expiry[key] = Date.now() + seconds * 1000;
        return 1;
    }
    async setex(key, seconds, value) {
        this.log('setex', key, seconds, value);
        this.store[key] = value;
        this.expiry[key] = Date.now() + seconds * 1000;
        return 'OK';
    }
    async del(key) {
        this.log('del', key);
        const existed = key in this.store;
        delete this.store[key];
        delete this.expiry[key];
        return existed ? 1 : 0;
    }
    async hgetall(key) {
        this.log('hgetall', key);
        if (this.isExpired(key))
            return null;
        return this.store[key] ?? null;
    }
    async hget(key, field) {
        this.log('hget', key, field);
        if (this.isExpired(key))
            return null;
        const hash = this.store[key];
        if (!hash || typeof hash !== 'object')
            return null;
        return hash[field] ?? null;
    }
    async hmset(key, values) {
        this.log('hmset', key, values);
        this.store[key] = { ...(this.store[key] || {}), ...values };
        return 'OK';
    }
    async zrange(key, start, stop, options) {
        this.log('zrange', key, start, stop, options);
        if (this.isExpired(key))
            return [];
        const zset = this.store[key] || [];
        const sorted = [...zset].sort((a, b) => {
            const scoreA = a.score ?? 0;
            const scoreB = b.score ?? 0;
            return options?.rev ? scoreB - scoreA : scoreA - scoreB;
        });
        const end = stop === -1 ? sorted.length : stop + 1;
        return sorted.slice(start, end).map(item => item.member);
    }
    async zadd(key, item) {
        this.log('zadd', key, item);
        if (!this.store[key]) {
            this.store[key] = [];
        }
        const zset = this.store[key];
        const existingIndex = zset.findIndex((z) => z.member === item.member);
        if (existingIndex >= 0) {
            zset[existingIndex] = item;
            return 0;
        }
        zset.push(item);
        return 1;
    }
    async zrem(key, member) {
        this.log('zrem', key, member);
        if (!this.store[key])
            return 0;
        const zset = this.store[key];
        const index = zset.findIndex((z) => z.member === member);
        if (index >= 0) {
            zset.splice(index, 1);
            return 1;
        }
        return 0;
    }
    async zcard(key) {
        this.log('zcard', key);
        if (this.isExpired(key))
            return 0;
        const zset = this.store[key];
        return Array.isArray(zset) ? zset.length : 0;
    }
    async sadd(key, ...members) {
        this.log('sadd', key, ...members);
        if (!this.store[key]) {
            this.store[key] = new Set();
        }
        const set = this.store[key];
        let added = 0;
        for (const member of members) {
            if (!set.has(member)) {
                set.add(member);
                added++;
            }
        }
        return added;
    }
    async scard(key) {
        this.log('scard', key);
        if (this.isExpired(key))
            return 0;
        const set = this.store[key];
        return set instanceof Set ? set.size : 0;
    }
    async smembers(key) {
        this.log('smembers', key);
        if (this.isExpired(key))
            return [];
        const set = this.store[key];
        return set instanceof Set ? Array.from(set) : [];
    }
    async incr(key) {
        this.log('incr', key);
        const current = this.store[key] ?? 0;
        const newValue = (typeof current === 'number' ? current : 0) + 1;
        this.store[key] = newValue;
        return newValue;
    }
    async incrby(key, increment) {
        this.log('incrby', key, increment);
        const current = this.store[key] ?? 0;
        const newValue = (typeof current === 'number' ? current : 0) + increment;
        this.store[key] = newValue;
        return newValue;
    }
    async keys(pattern) {
        this.log('keys', pattern);
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
        return Object.keys(this.store).filter(key => regex.test(key) && !this.isExpired(key));
    }
    pipeline() {
        const commands = [];
        const pipelineProxy = {
            get: (key) => {
                commands.push(() => this.get(key));
                return pipelineProxy;
            },
            set: (key, value, options) => {
                commands.push(() => this.set(key, value, options));
                return pipelineProxy;
            },
            setnx: (key, value) => {
                commands.push(() => this.setnx(key, value));
                return pipelineProxy;
            },
            expire: (key, seconds) => {
                commands.push(() => this.expire(key, seconds));
                return pipelineProxy;
            },
            setex: (key, seconds, value) => {
                commands.push(() => this.setex(key, seconds, value));
                return pipelineProxy;
            },
            del: (key) => {
                commands.push(() => this.del(key));
                return pipelineProxy;
            },
            hgetall: (key) => {
                commands.push(() => this.hgetall(key));
                return pipelineProxy;
            },
            hmset: (key, values) => {
                commands.push(() => this.hmset(key, values));
                return pipelineProxy;
            },
            zadd: (key, item) => {
                commands.push(() => this.zadd(key, item));
                return pipelineProxy;
            },
            zrem: (key, member) => {
                commands.push(() => this.zrem(key, member));
                return pipelineProxy;
            },
            zrange: (key, start, stop, options) => {
                commands.push(() => this.zrange(key, start, stop, options));
                return pipelineProxy;
            },
            zcard: (key) => {
                commands.push(() => this.zcard(key));
                return pipelineProxy;
            },
            incr: (key) => {
                commands.push(() => this.incr(key));
                return pipelineProxy;
            },
            incrby: (key, increment) => {
                commands.push(() => this.incrby(key, increment));
                return pipelineProxy;
            },
            sadd: (key, ...members) => {
                commands.push(() => this.sadd(key, ...members));
                return pipelineProxy;
            },
            scard: (key) => {
                commands.push(() => this.scard(key));
                return pipelineProxy;
            },
            exec: async () => Promise.all(commands.map(command => command())),
        };
        return pipelineProxy;
    }
    __reset() {
        this.store = {};
        this.expiry = {};
        this.callLog = [];
    }
    __getCallLog() {
        return [...this.callLog];
    }
    __getStore() {
        return { ...this.store };
    }
    __setKey(key, value) {
        this.store[key] = value;
    }
}
let mockInstance = null;
export function getMockKV() {
    if (!mockInstance) {
        mockInstance = new MockKV();
    }
    return mockInstance;
}
export function resetMockKV() {
    if (mockInstance) {
        mockInstance.__reset();
    }
}
export function shouldUseMockKV() {
    return process.env.MOCK_CACHE === '1';
}
