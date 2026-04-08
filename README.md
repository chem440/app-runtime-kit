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

## CI contract

The required CI checks are:

1. `npm run type-check`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

`npm run ci:platform` runs the same contract in order.
