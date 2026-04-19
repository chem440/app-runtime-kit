# Changelog

## 0.0.8

### Breaking changes

- **`reports/` module removed.** All visualization, cache, and reporting contract types have been moved to the consuming app. If you were importing from `@app-runtime-kit/core/reports/*`, move those files into your app's local `lib/reports/` directory.
- **`SettingsServiceAdapter` — legacy method aliases removed.** The following methods no longer exist on the interface:
  - `getMenteeMentorState()` → use `getConnectionState()` (returns `{ connection, pendingInvite }`)
  - `becomeMentor()` → use `enableAdvisorMode()`
  - `deactivateMentor()` → use `disableAdvisorMode()`
  - `sendInvite()` → use `sendConnectionInvite()`
  - `cancelInvite()` → use `cancelConnectionInvite()`
  - `removeMentor()` → use `removeConnection()`
  - `clearWeeklyCap()` → use `clearUsagePeriod()`
- **`SettingsPendingConnectionInvite`** — `mentorEmail` field removed. Use `inviteEmail`.
- **`telemetryKeys.billing` removed** from the kit. App-specific billing key namespaces belong in the consuming app's local telemetry module.
- **`AI_USAGE_METRICS`, `AIUsageMetric`, `getAllAIUsageKeys` removed** from the kit. These hardcode OpenAI metric names and are app-specific.
- **KV subpath exports removed** (`./kv/kv`, `./kv/mock`, `./kv/metrics`). Import from `./kv` barrel only.

### Improvements

- **`determineTierChangeReason`** now accepts `tierRanks: Record<string, number>` and `freeBaseTierId: string` parameters. Callers inject their own tier taxonomy; no tier names are hardcoded in the kit.
- **`getWeekKey(date, tz?)`** and **`getWeekStartInZone(date, tz?)`** — timezone is now configurable. Defaults to `America/Los_Angeles`. `getWeekStartPT` is kept as a deprecated alias.
- `SettingsServiceAdapter` JSDoc added to every method.
- README rewritten to document all public contracts with usage examples.

## 0.0.7 and earlier

Internal development. No public changelog.
