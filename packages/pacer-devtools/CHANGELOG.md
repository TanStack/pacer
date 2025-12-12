# @tanstack/pacer-devtools

## 1.1.0

### Minor Changes

- feat: add preact adapter\ ([#112](https://github.com/TanStack/pacer/pull/112))

## 1.0.1

### Patch Changes

- build: migrate to tsdown ([#113](https://github.com/TanStack/pacer/pull/113))

- Updated dependencies [[`adc3193`](https://github.com/TanStack/pacer/commit/adc3193e2a8d15de29b89444f775e8e1b0302e3e)]:
  - @tanstack/pacer@0.16.4

## 1.0.0

### Minor Changes

- - feat:Added `AsyncRetryer` class and `asyncRetry` function with exponential/linear/fixed backoff strategies, jitter support, timeout controls (`maxExecutionTime`, `maxTotalExecutionTime`), lifecycle callbacks (`onRetry`, `onSuccess`, `onError`, `onLastError`, `onSettled`, `onAbort`, `onExecutionTimeout`, `onTotalExecutionTimeout`), dynamic options, and built-in retry integration via `asyncRetryerOptions` for all async utilities (`AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`) ([#54](https://github.com/TanStack/pacer/pull/54))
  - feat: Added `getAbortSignal()` method to all async utilities (`AsyncRetryer`, `AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`) to enable true cancellation of underlying async operations (like fetch requests) when `abort()` is called
  - feat: Added `asyncBatcherOptions`, `asyncDebouncerOptions`, `asyncQueuerOptions`, `asyncRateLimiterOptions`, `asyncRetryerOptions`, `asyncThrottlerOptions`, `debouncerOptions`, `queuerOptions`, `rateLimiterOptions`, `throttlerOptions` utility functions for sharing common options between different pacer utilities
  - fix: Fixed async-throtter trailing edge behavior when long executions were awaited.
  - breaking: standardized `reset`, `cancel` and `abort` API behaviors with consistent naming and behavior across all async utilities. Canceling no longer aborts, new dedicated `abort` method is provided for aborting ongoing executions.

### Patch Changes

- Updated dependencies [[`3124ea3`](https://github.com/TanStack/pacer/commit/3124ea34cab13dd69f286a6836c585aaf6f083c4)]:
  - @tanstack/pacer@0.16.0

## 0.3.1

### Patch Changes

- update pacer devtools to use devtools-utils to avoid common issues in user projects ([#80](https://github.com/TanStack/pacer/pull/80))

## 0.3.0

### Minor Changes

- Added light/dark mode support to Pacer devtools, updated to latest versions of underlying devtools packages and added plugins in favor of users manually defining the panels ([#62](https://github.com/TanStack/pacer/pull/62))

## 0.2.0

### Minor Changes

- Dropped CJS support, added consistency to styling ([#59](https://github.com/TanStack/pacer/pull/59))

## 0.1.0

### Minor Changes

- feat: added pacer devtools ([`3206b5f`](https://github.com/TanStack/pacer/commit/3206b5f8167d13bc1c642c53574bb65ea126d24b))

### Patch Changes

- Updated dependencies [[`3206b5f`](https://github.com/TanStack/pacer/commit/3206b5f8167d13bc1c642c53574bb65ea126d24b)]:
  - @tanstack/pacer@0.15.0
