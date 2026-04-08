# @app-runtime-kit/core (split bootstrap)

This repo is bootstrapped from `packages/platform` in the app monorepo.

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
