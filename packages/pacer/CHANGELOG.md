# @tanstack/pacer

## 0.15.2

### Patch Changes

- fix an issue with react-native and event listeners ([`1a241bf`](https://github.com/TanStack/pacer/commit/1a241bfa25e68044d38f8ae13456dd68d9caff14))

## 0.15.1

### Patch Changes

- fix: queues with priority always pop from front ([#57](https://github.com/TanStack/pacer/pull/57))

## 0.15.0

### Minor Changes

- feat: added pacer devtools ([`3206b5f`](https://github.com/TanStack/pacer/commit/3206b5f8167d13bc1c642c53574bb65ea126d24b))

## 0.14.0

### Minor Changes

- fix: remove unneeded structuredClone for state resets ([`98ae22c`](https://github.com/TanStack/pacer/commit/98ae22c5836aca9ff6a404770d7f210e686e098c))

## 0.13.0

### Minor Changes

- breaking: added items/batch/args as params to onSuccess, onSettled, and onExecute callbacks ([`e92923b`](https://github.com/TanStack/pacer/commit/e92923b764c6eb42b76bd5edaaac446c4f6a13f9))

## 0.12.0

### Minor Changes

- breaking: changed callback signature of `onError` in AsyncDebouncer, AsyncThrottler, AsyncQueuer, AsyncRatelimiter, and AsyncBatcher to include the item that caused the error ([#45](https://github.com/TanStack/pacer/pull/45))
  fix: Fixed Error Handling in Async Debouncer and Throttler by properly resolving and rejecting returned promises from `maybeExecute`

## 0.11.0

### Minor Changes

- fix: lastArgs in `Debouncer` and `AsyncDebouncer` not getting set to undefined after execution ([#43](https://github.com/TanStack/pacer/pull/43))
  fix: `nextExecution` in `Throttler` and `AsyncThrottler` not getting set to undefined after timestamp has passed

## 0.10.0

### Minor Changes

- breaking: Removed `isRunning` state from `Batcher` and `AsyncBatcher` utils, and also removed `start` and `stop` methods ([#40](https://github.com/TanStack/pacer/pull/40))
  breaking: Changed `flush()` method in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncQueuer` to return Promises instead of void
  feat: Added `flushAsBatch` methods to the `Queuer` and `AsyncQueuer` utils
  feat: Added `isExceeded` and `status` state properties to `RateLimiter` and `AsyncRateLimiter` for better rate limit tracking
  feat: Enhanced error handling in `AsyncDebouncer` and `AsyncThrottler` with proper promise rejection support
  feat: Improved timeout management in rate limiters with automatic cleanup of expired execution times

## 0.9.1

### Patch Changes

- Fixed queuer being stuck after flush ([`6b435f5`](https://github.com/TanStack/pacer/commit/6b435f53a628e4103b9a9589b61240896b85cf55))

## 0.9.0

### Minor Changes

- - breaking: Removed most "get" methods that can now be read directly from the state (e.g. `debouncer.getExecutionCount()` -> `debouncer.store.state.executionCount` or `debouncer.state.executionCount` in framework adapters) ([#32](https://github.com/TanStack/pacer/pull/32))
  - breaking: Removed `getOptions` and other option resolver methods such as `getEnabled` and `getWait`
  - feat: Rewrote TanStack Pacer to use TanStack Store for state management
  - feat: Added `flush` methods to all utils to trigger pending executions to execute immediately.
  - feat: Added an `initialState` option to all utils to set the initial state for persistence features
  - feat: Added status state to all utils except rate-limiters for pending, excution, etc. states.
  - feat: Added new AsyncBatcher utility
  - fix: Multiple bug fixes

## 0.8.0

### Minor Changes

- breaking: Renamed `get*Item` instance methods to `peek*Item` instance methods to indicate that they do not pop or process items ([`1599c97`](https://github.com/TanStack/pacer/commit/1599c9785f7496648a2b44274b839c7f784ce7f5))

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
