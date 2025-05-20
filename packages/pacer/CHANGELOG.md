# @tanstack/pacer

## 0.7.0

### Minor Changes

- feat: New `Batcher` Utility to batch process items ([#25](https://github.com/TanStack/pacer/pull/25))
  fix: Fixed `AsyncDebouncer` and `AsyncThrottler` to resolve previous promises on new executions
  breaking: `Queuer` and `AsyncQueuer` have new required `fn` parameter before the `options` parameter to match other utilities and removed `onGetNextItem` option
  breaking: `Queuer` and `AsyncQueuer` now use `execute` method instead instead of `getNextItem`, but both methods are now public
  breaking: For the `AsyncQueuer`, you now add items instead of functions to the AsyncQueuer. The `fn` parameter is now the function to execute for each item.

## 0.6.0

### Minor Changes

- breaking: remove `onError`, `onSuccess`, `onSettled` options from `AsyncQueuer` in favor of options of the same name on the `AsyncQueuer` ([#22](https://github.com/TanStack/pacer/pull/22))
  feat: standardize error handling callbacks on `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`
  feat: add `throwOnError` option to `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`

## 0.5.0

### Minor Changes

- feat: let enabled, wait, limit, window, and concurrency options support callback variants ([#20](https://github.com/TanStack/pacer/pull/20))
  breaking: set queuer to be started by default

## 0.4.0

### Minor Changes

- Added fixed and sliding windowTypes to rate limiters ([#17](https://github.com/TanStack/pacer/pull/17))
  Added `getIsExecuting` to `AsyncRateLimiter`

## 0.3.0

### Minor Changes

- feat: add queuer expiration feature to `AsyncQueuer` and `Queuer` ([#12](https://github.com/TanStack/pacer/pull/12))
- feat: add return values and types to `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- feat: standardize `onSuccess`, `onSettled`, and `onError` in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- feat: replace `getExecutionCount` with `getSuccessCount`, `getErrorCount`, and `getSettleCount` in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- feat: add `getIsPending`, `getIsExecuting`, and `getLastResult` to `AsyncThrottler`
- feat: add `leading` and `trailing` options to `AsyncThrottler`
- breaking: rename `onExecute` to `onSettled` in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- breaking: Set `started` to `true` by default in `AsyncQueuer` and `Queuer`
- breaking: Simplified generics to just use `TFn` instead of `TFn, TArgs` in debouncers, throttlers, and rate limiters
- fix: fixed leading and trailing edge behavior of `Debouncer` and `AsyncDebouncer`
- fix: fixed `getIsPending` to return correct value in `AsyncDebouncer`

## 0.2.0

### Minor Changes

- feat: Add Solid JS Adapter ([`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16))
- rewrote all instance methods on utilities for reading state to use `get*` naming convention
- added `getOptions` methods to all utilities for reading options
- changed rate limiter's `onReject` signature to match other utilities
- added an `onReject` option to the queuer utilities
- added `onExecute`, `onItemsChanged`, `onIsRunningChanged`, and other callbacks to all utilities
- added `getIsPending` methods to debouncer and throttler

## 0.1.0

### Minor Changes

- feat: Initial release ([#2](https://github.com/TanStack/pacer/pull/2))
