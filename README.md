# @app-runtime-kit/core

Runtime foundation kit for app-layer concerns:
- cache/kv wrappers
- telemetry keying + accumulation helpers
- settings + subscription service contracts
- SWR primitives
- report contracts/helpers
- audio UI primitives

## Verify

```bash
npm ci
npm run ci:platform
```

## Test Baseline

This package follows a baseline where tests must validate behavior contracts (beyond file execution):

1. Contract tests: adapter/service API shape and delegation behavior
2. Safety tests: deterministic unconfigured fallbacks
3. Policy tests: retry/backoff and other runtime policy rules
4. Utility tests: shared helper correctness

Coverage gate (Vitest):
- Lines >= 70%
- Statements >= 70%
- Branches >= 65%
- Functions >= 50%

Run:

```bash
npm run test
npm run test:coverage
```

Generate coverage for a specific file or suite:

```bash
npm run test:coverage:target -- telemetry/__tests__/subscriptionMetrics.test.ts
npm run test:coverage:target -- reports/__tests__/
```

Each run writes an isolated report under `coverage/targets/<target>-<timestamp>/`.

## First-Time Standalone Setup

For standalone usage, initialize a local runtime configuration once:

```bash
npm run setup:standalone
```

This writes:
- `.runtime-kit/standalone.config.json`

Defaults come from `profiles/defaults.json` and are intentionally platform-generic.

To overwrite an existing config:

```bash
npm run setup:standalone -- --force=true
```

## CI contract

The required CI checks are:

1. `npm run type-check`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

`npm run ci:platform` runs the same contract in order.
