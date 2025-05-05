# @tanstack/pacer

## 0.3.0

### Minor Changes

- - feat: add queuer expiration feature to `AsyncQueuer` and `Queuer` ([#12](https://github.com/TanStack/pacer/pull/12))
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

- - feat: Add Solid JS Adapter ([`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16))
  - rewrote all instance methods on utilities for reading state to use `get*` naming convention
  - added `getOptions` methods to all utilities for reading options
  - changed rate limiter's `onReject` signature to match other utilities
  - added an `onReject` option to the queuer utilities
  - added `onExecute`, `onItemsChanged`, `onIsRunningChanged`, and other callbacks to all utilities
  - added `getIsPending` methods to debouncer and throttler

## 0.1.0

### Minor Changes

- feat: Initial release ([#2](https://github.com/TanStack/pacer/pull/2))
