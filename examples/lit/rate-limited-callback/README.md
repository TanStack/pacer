# Lit rate limited callback

From the repository root, run `pnpm install`. Then run `pnpm dev` in this directory.

Run `pnpm test:types` for the native TypeScript check and `pnpm test:e2e` for browser tests.
Use `createRateLimiter` and its `maybeExecute` method to create the event handler. The adapter owns reactive options and lifecycle cleanup.
