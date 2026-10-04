# Example end-to-end tests

React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, and Octane examples keep their Playwright specs in `examples/<framework>/<example>/tests/e2e`. Angular specs use `.spec.mts` so Playwright loads them as ES modules without changing the Angular application's module type. Each example has a smoke test and tests for the utility's visible behavior.

## Run tests

Install dependencies from the repository root, then install Chromium:

```sh
pnpm install
pnpm test:e2e:install
```

Run all example tests, or only examples affected by your changes:

```sh
pnpm test:e2e
pnpm test:e2e:affected
```

Nx builds workspace dependencies before starting the tests. Each example gets one browser worker and its own development server on an available port. Nx runs two examples concurrently.

To run one example with its build dependencies:

```sh
pnpm exec nx run @tanstack/pacer-example-react-use-debouncer:test:e2e
```

After building dependencies, run Playwright directly to filter tests or debug:

```sh
pnpm exec playwright test --project='solid/*'
pnpm exec playwright test --project=react/useDebouncer
pnpm exec playwright test --project=react/useDebouncer --debug
```

Failed tests save screenshots and traces under `test-results/`. CI uploads them as an artifact. Open a trace with `pnpm exec playwright show-trace <path-to-trace.zip>`.

## Add or change a test

Import `test` and `expect` from `tests/e2e/helpers/fixtures`. The `exampleUrl` worker fixture starts Vite with the example's configuration or starts Angular CLI for Angular examples. It closes the server when the worker finishes. Each test gets a fresh page; navigate to `exampleUrl` after registering any network routes or installing the Playwright clock.

Assert visible output and meaningful behavior such as coalescing calls, limiting executions, draining a queue, or processing a batch. Use accessible locators and scope repeated controls to their example section. Advance the Playwright clock for scheduled behavior instead of adding fixed sleeps.

The page fixture fails on uncaught browser errors and blocks the optional React Scan CDN script. Query tests mock JSONPlaceholder before navigation so test results do not depend on that service. Keep simulated failures deterministic and assert their displayed outcomes.

Register a new example's `test:e2e` script using the existing example manifests. Include its specs in the shared e2e TypeScript check. Run `pnpm test:e2e:types` to verify discovery for every framework example and check the config, fixtures, and specs. Run `pnpm test:e2e:lint` to lint them.
