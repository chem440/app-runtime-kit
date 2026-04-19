# @app-runtime-kit/core

A framework layer for Next.js apps that enforces contracts around KV abstraction, SWR-driven page rendering, settings adapters, and telemetry key builders.

**This is not a general-purpose utility library.** It encodes specific patterns for a specific app architecture: server-side KV caching, SWR as a page-rendering primitive, settings UIs backed by a service adapter, and structured telemetry key namespacing.

---

## KV Adapter

The kit exposes a provider-agnostic `kv` client. Apps wire their preferred KV backend at startup; all cache reads and writes go through this one instrumented client.

### 1. Implement `KVAdapter`

```typescript
import type { KVAdapter } from '@app-runtime-kit/core/kv'

const myKvClient: KVAdapter = {
    async get(key) { /* ... */ },
    async set(key, value, options) { /* ... */ },
    async del(key) { /* ... */ },
    async mget(...keys) { /* ... */ },
    async smembers(key) { /* ... */ },
    async scard(key) { /* ... */ },
    async sadd(key, ...members) { /* ... */ },
    async incr(key) { /* ... */ },
    async incrby(key, increment) { /* ... */ },
    async expire(key, seconds) { /* ... */ },
    async setnx(key, value) { /* ... */ },
    async keys(pattern) { /* ... */ },
    pipeline() { /* returns KVPipeline */ },
}
```

### 2. Initialize at startup

```typescript
import { initKV } from '@app-runtime-kit/core/kv'
import { Redis } from '@upstash/redis'

initKV(new Redis({ url: process.env.KV_URL!, token: process.env.KV_TOKEN! }))
```

Call `initKV` once, before any route handler or server component accesses `kv`.

### 3. Use `kv` anywhere

```typescript
import { kv } from '@app-runtime-kit/core/kv'

await kv.set('some:key', value, { ex: 3600 })
const cached = await kv.get<MyType>('some:key')
```

The `kv` export is an instrumented proxy. All operations are tracked via `recordKVOp` and accessible via `getKVMetricsSnapshot()`.

### Tests

Set `MOCK_CACHE=1` in the test environment. The kit will auto-activate `MockKV` (in-memory, no real KV required). Or import `getMockKV()` explicitly.

---

## SWR Page Rendering

This kit treats SWR as a page-rendering primitive, not just a data-fetching hook. The pattern:

1. Server component fetches initial data (for instant paint, no loading flash)
2. `SWRProvider` seeds that data into the SWR cache
3. Client SWR hooks pick up the seed and revalidate on focus/interval

### Setup

```typescript
// In a server component or layout:
import { SWRProvider } from '@app-runtime-kit/core/swr'

const initialData = await fetchMyData()

return (
    <SWRProvider fallback={{ '/api/my-data': initialData }}>
        <MyPage />
    </SWRProvider>
)
```

### Deduping

```typescript
import { dedupingConfig, createDedupedFetcher } from '@app-runtime-kit/core/swr'

// Use a pre-configured interval for your data category:
const { refreshInterval } = dedupingConfig.PROFILE  // 60s, good for account/subscription data

// Or create a fetcher with built-in deduplication:
const fetchMyData = createDedupedFetcher('/api/my-data', dedupingConfig.ANALYTICS)
```

Categories: `REALTIME` (5s), `ANALYTICS` (30s), `PROFILE` (60s), `STATIC` (300s).

---

## Settings Service Adapter

The settings UI is decoupled from the backend via `SettingsServiceAdapter`. Apps implement this interface to wire their own API endpoints.

### Implement the adapter

```typescript
import type { SettingsServiceAdapter } from '@app-runtime-kit/core/settings'

export const mySettingsAdapter: SettingsServiceAdapter = {
    async getPreferences() {
        const res = await fetch('/api/user/preferences')
        const json = await res.json()
        return json.success ? json.data : null
    },

    async getConnectionState() {
        // Fetch advisor/mentor connection and any pending invite
        return { connection: null, pendingInvite: null }
    },

    async enableAdvisorMode() { /* POST /api/user/become-advisor */ },
    async disableAdvisorMode() { /* DELETE /api/user/become-advisor */ },
    async sendConnectionInvite(email) { /* POST /api/connections/invite */ },
    async cancelConnectionInvite() { /* DELETE /api/connections/invite */ },
    async removeConnection() { /* DELETE /api/connections/current */ },
    async clearUsagePeriod() { /* Admin: reset weekly usage */ },

    async getProfile() { /* ... */ },
    async saveProfile(profile) { /* ... */ },
    async openBillingPortal() { /* ... */ },
    async cancelSubscription() { /* ... */ },
    async reactivateSubscription() { /* ... */ },
    async syncAccountInfo(force) { /* ... */ },

    resolveTierBranding(tierId, tierName) { /* Map tier ID to display gradient */ },
    getBillingUiPolicy(accountInfo) { /* Which billing UI elements to show */ },
    refreshUserStatus() { /* Trigger re-fetch of user status after role changes */ },
    invalidateAccountInfo() { /* Bust SWR cache for account info */ },
    invalidateSubscriptionWarning() { /* Bust subscription warning cache */ },
}
```

### Connections model

`getConnectionState` / `sendConnectionInvite` / `removeConnection` model a generic user-to-user relationship (advisor/mentee, coach/student, peer). Apps map these to their domain. The kit does not know what the relationship means — only that one user can invite another and manage the link.

### Tier branding

`resolveTierBranding` maps a tier ID to visual styling (gradient, border color, tagline). Apps inject their own tier→style map:

```typescript
import { resolveSettingsTierBranding } from '@app-runtime-kit/core/settings'

resolveTierBranding(tierId, tierName) {
    return resolveSettingsTierBranding({
        tierId,
        tierName,
        tierBrandingById: {
            'FREE': { gradient: 'from-gray-400 to-gray-500', borderColor: 'border-gray-300', tagline: 'Free' },
            'PRO': { gradient: 'from-blue-500 to-blue-700', borderColor: 'border-blue-400', tagline: 'Pro' },
        }
    })
}
```

---

## Telemetry Key Builders

Generic namespaced key builders for KV-backed telemetry. Apps define their own metric registries on top.

```typescript
import {
    aiUsageKey,
    capabilityKey,
    pageLoadKey,
    apiTimingKey,
    lastFlushKey,
    telemetryKeys,
} from '@app-runtime-kit/core/telemetry'

// Generic builders
aiUsageKey('user-123', 'calls')           // → 'ai:usage:user-123:calls'
capabilityKey('user-123', 'lesson_start') // → 'telemetry:capability:user-123:lesson_start'
pageLoadKey('user-123', '/dashboard')     // → 'telemetry:page:user-123:/dashboard'

// Cap enforcement events
telemetryKeys.caps.rejected('weekly_limit', 'PRO')  // → 'caps:rejected:weekly_limit:PRO'
telemetryKeys.caps.weeklyReset()                    // → 'caps:weekly_reset'
```

### Extending with app-specific keys

Apps define their own key namespaces locally:

```typescript
// In your app: lib/telemetry/keys.ts
import { telemetryKeys as platformKeys } from '@app-runtime-kit/core/telemetry'

export const telemetryKeys = {
    ...platformKeys,
    billing: {
        plansViewed: (source: string) => `billing:plans_viewed:${source}`,
        checkoutStarted: (tierId: string, interval: string) =>
            `billing:checkout_started:${tierId}:${interval}`,
    },
}
```

### Tier change classification

```typescript
import { determineTierChangeReason } from '@app-runtime-kit/core/telemetry'

const ranks = { FREE: 0, PRO: 1, PREMIUM: 2 }
const reason = determineTierChangeReason('PRO', 'FREE', false, ranks, 'FREE')
// → 'churn'
```

Pass your app's tier rank map and free-tier ID. No tier names are hardcoded in the kit.

### Week keys

```typescript
import { getWeekKey, getWeekStartInZone } from '@app-runtime-kit/core/telemetry'

getWeekKey(new Date(), 'America/New_York')    // → '2026-W15'
getWeekStartInZone(new Date(), 'UTC')         // → Date (Sunday at midnight UTC)
getWeekKey()                                  // defaults to America/Los_Angeles
```

---

## What this kit is NOT

- Not a general-purpose utility library (no string utils, no date formatting, no auth)
- Not a UI component library (the settings modal UI is in the consuming app)
- Not a database layer (no Prisma, no SQL — apps bring their own persistence)
- Not a reporting framework (visualization, charting, and query code belongs in the app)
- Not opinionated about billing providers, auth providers, or infrastructure

---

## CHANGELOG

See [CHANGELOG.md](./CHANGELOG.md).
