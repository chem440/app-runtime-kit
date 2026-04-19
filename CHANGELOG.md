# Current Surface

This file describes what `@app-runtime-kit/core` provides today.

## Modules

- `kv`: adapter interface, instrumented `kv` proxy, mock/test utilities, metrics snapshot helpers
- `swr`: `SWRProvider`, deduping interval helpers, and deduped fetcher factory
- `settings`: service adapter contract + tier branding helpers
- `services`: wrapper services for settings/subscription flows
- `telemetry`: key helpers, tier/subscription telemetry services, model usage accumulation, week utilities

## Not Included

- `audio/*` exports (now app-owned)
- `reports/*` exports (now app-owned)
- vendor-specific billing/auth/infra contracts
