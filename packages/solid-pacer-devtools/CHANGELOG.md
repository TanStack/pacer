# @tanstack/solid-pacer-devtools

## 0.5.1

### Patch Changes

- devtools and event-client version bumps ([`17b9704`](https://github.com/TanStack/pacer/commit/17b9704d8b04890665975c09587f035911a2a5cc))

- Updated dependencies [[`17b9704`](https://github.com/TanStack/pacer/commit/17b9704d8b04890665975c09587f035911a2a5cc)]:
  - @tanstack/pacer-devtools@1.1.1

## 0.5.0

### Minor Changes

- feat: add preact adapter\ ([#112](https://github.com/TanStack/pacer/pull/112))

### Patch Changes

- Updated dependencies [[`2906cd3`](https://github.com/TanStack/pacer/commit/2906cd3ca1a4bc54460cf8558dbff2d8f4089f6c)]:
  - @tanstack/pacer-devtools@1.1.0

## 0.4.1

### Patch Changes

- build: migrate to tsdown ([#113](https://github.com/TanStack/pacer/pull/113))

- Updated dependencies [[`adc3193`](https://github.com/TanStack/pacer/commit/adc3193e2a8d15de29b89444f775e8e1b0302e3e)]:
  - @tanstack/pacer-devtools@1.0.1

## 0.4.0

### Minor Changes

- - feat:Added `AsyncRetryer` class and `asyncRetry` function with exponential/linear/fixed backoff strategies, jitter support, timeout controls (`maxExecutionTime`, `maxTotalExecutionTime`), lifecycle callbacks (`onRetry`, `onSuccess`, `onError`, `onLastError`, `onSettled`, `onAbort`, `onExecutionTimeout`, `onTotalExecutionTimeout`), dynamic options, and built-in retry integration via `asyncRetryerOptions` for all async utilities (`AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`) ([#54](https://github.com/TanStack/pacer/pull/54))
  - feat: Added `getAbortSignal()` method to all async utilities (`AsyncRetryer`, `AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`) to enable true cancellation of underlying async operations (like fetch requests) when `abort()` is called
  - feat: Added `asyncBatcherOptions`, `asyncDebouncerOptions`, `asyncQueuerOptions`, `asyncRateLimiterOptions`, `asyncRetryerOptions`, `asyncThrottlerOptions`, `debouncerOptions`, `queuerOptions`, `rateLimiterOptions`, `throttlerOptions` utility functions for sharing common options between different pacer utilities
  - fix: Fixed async-throtter trailing edge behavior when long executions were awaited.
  - breaking: standardized `reset`, `cancel` and `abort` API behaviors with consistent naming and behavior across all async utilities. Canceling no longer aborts, new dedicated `abort` method is provided for aborting ongoing executions.

### Patch Changes

- Updated dependencies [[`3124ea3`](https://github.com/TanStack/pacer/commit/3124ea34cab13dd69f286a6836c585aaf6f083c4)]:
  - @tanstack/pacer-devtools@1.0.0

## 0.3.1

### Patch Changes

- update pacer devtools to use devtools-utils to avoid common issues in user projects ([#80](https://github.com/TanStack/pacer/pull/80))

- Updated dependencies [[`4dfd562`](https://github.com/TanStack/pacer/commit/4dfd5628da366d82fc0264ba9d98c02c30a2508d)]:
  - @tanstack/pacer-devtools@0.3.1

## 0.3.0

### Minor Changes

- Added light/dark mode support to Pacer devtools, updated to latest versions of underlying devtools packages and added plugins in favor of users manually defining the panels ([#62](https://github.com/TanStack/pacer/pull/62))

### Patch Changes

- Updated dependencies [[`cbb2855`](https://github.com/TanStack/pacer/commit/cbb285548a49799494c6fb2196aa06b6e181720f)]:
  - @tanstack/pacer-devtools@0.3.0

## 0.2.0

### Minor Changes

- Dropped CJS support, added consistency to styling ([#59](https://github.com/TanStack/pacer/pull/59))

### Patch Changes

- Updated dependencies [[`6922ad1`](https://github.com/TanStack/pacer/commit/6922ad12e56a447f76eb9cbfad63fd054354cd80)]:
  - @tanstack/pacer-devtools@0.2.0

## 0.1.0

### Minor Changes

- feat: added pacer devtools ([`3206b5f`](https://github.com/TanStack/pacer/commit/3206b5f8167d13bc1c642c53574bb65ea126d24b))

### Patch Changes

- Updated dependencies [[`3206b5f`](https://github.com/TanStack/pacer/commit/3206b5f8167d13bc1c642c53574bb65ea126d24b)]:
  - @tanstack/pacer-devtools@0.1.0
