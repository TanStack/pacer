# @tanstack/react-pacer

## 0.11.0

### Minor Changes

- breaking: selectors are required in react and solid adapters in order to read state changes with reactivity ([#43](https://github.com/TanStack/pacer/pull/43))

### Patch Changes

- Updated dependencies [[`7969682`](https://github.com/TanStack/pacer/commit/7969682be3bf8745822baf646d74e17ddb64afac)]:
  - @tanstack/pacer@0.11.0

## 0.10.0

### Minor Changes

- breaking: Removed `isRunning` state from `Batcher` and `AsyncBatcher` utils, and also removed `start` and `stop` methods ([#40](https://github.com/TanStack/pacer/pull/40))
  breaking: Changed `flush()` method in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncQueuer` to return Promises instead of void
  feat: Added `flushAsBatch` methods to the `Queuer` and `AsyncQueuer` utils
  feat: Added `isExceeded` and `status` state properties to `RateLimiter` and `AsyncRateLimiter` for better rate limit tracking
  feat: Enhanced error handling in `AsyncDebouncer` and `AsyncThrottler` with proper promise rejection support
  feat: Improved timeout management in rate limiters with automatic cleanup of expired execution times

### Patch Changes

- Updated dependencies [[`d229d42`](https://github.com/TanStack/pacer/commit/d229d42e95d9da3e8a7f301ce47cf738a9a01f1f)]:
  - @tanstack/pacer@0.10.0

## 0.9.1

### Patch Changes

- Updated dependencies [[`6b435f5`](https://github.com/TanStack/pacer/commit/6b435f53a628e4103b9a9589b61240896b85cf55)]:
  - @tanstack/pacer@0.9.1

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

### Patch Changes

- Updated dependencies [[`9e7bcb1`](https://github.com/TanStack/pacer/commit/9e7bcb1edf5e53314a6b808b6b9b22ea48df84ff)]:
  - @tanstack/pacer@0.9.0

## 0.8.0

### Minor Changes

- breaking: Renamed `get*Item` instance methods to `peek*Item` instance methods to indicate that they do not pop or process items ([`1599c97`](https://github.com/TanStack/pacer/commit/1599c9785f7496648a2b44274b839c7f784ce7f5))

### Patch Changes

- Updated dependencies [[`1599c97`](https://github.com/TanStack/pacer/commit/1599c9785f7496648a2b44274b839c7f784ce7f5)]:
  - @tanstack/pacer@0.8.0

## 0.7.0

### Minor Changes

- feat: New `Batcher` Utility to batch process items ([#25](https://github.com/TanStack/pacer/pull/25))
  fix: Fixed `AsyncDebouncer` and `AsyncThrottler` to resolve previous promises on new executions
  breaking: `Queuer` and `AsyncQueuer` have new required `fn` parameter before the `options` parameter to match other utilities and removed `onGetNextItem` option
  breaking: `Queuer` and `AsyncQueuer` now use `execute` method instead instead of `getNextItem`, but both methods are now public
  breaking: For the `AsyncQueuer`, you now add items instead of functions to the AsyncQueuer. The `fn` parameter is now the function to execute for each item.

### Patch Changes

- Updated dependencies [[`9c03795`](https://github.com/TanStack/pacer/commit/9c037959e90a67ebe3a848fd711bbbd8f3c283cb)]:
  - @tanstack/pacer@0.7.0

## 0.6.0

### Minor Changes

- breaking: remove `onError`, `onSuccess`, `onSettled` options from `AsyncQueuer` in favor of options of the same name on the `AsyncQueuer` ([#22](https://github.com/TanStack/pacer/pull/22))
  feat: standardize error handling callbacks on `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`
  feat: add `throwOnError` option to `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`

### Patch Changes

- Updated dependencies [[`b3d5247`](https://github.com/TanStack/pacer/commit/b3d52477a387f52b0242d2d753f5f271beb92283)]:
  - @tanstack/pacer@0.6.0

## 0.5.0

### Minor Changes

- feat: let enabled, wait, limit, window, and concurrency options support callback variants ([#20](https://github.com/TanStack/pacer/pull/20))
  breaking: set queuer to be started by default

### Patch Changes

- Updated dependencies [[`a3294e7`](https://github.com/TanStack/pacer/commit/a3294e722915f3a17ea6a1333978994c57568a57)]:
  - @tanstack/pacer@0.5.0

## 0.4.0

### Minor Changes

- Added fixed and sliding windowTypes to rate limiters ([#17](https://github.com/TanStack/pacer/pull/17))
  Added `getIsExecuting` to `AsyncRateLimiter`

### Patch Changes

- Updated dependencies [[`f12ba56`](https://github.com/TanStack/pacer/commit/f12ba561d9eafb6a19a16514f8db1a2f5f6fda82)]:
  - @tanstack/pacer@0.4.0

## 0.3.0

### Minor Changes

- - breaking: renamed `useQueuerState` hook to `useQueuedState` ([#12](https://github.com/TanStack/pacer/pull/12))
  - breaking: changed return signature of `useQueuedState` to include the `addItem` function
  - feat: add `useQueuedValue` hook

### Patch Changes

- Updated dependencies [[`35efeea`](https://github.com/TanStack/pacer/commit/35efeeab76d54a1479bd158db9b804b60e87d89b)]:
  - @tanstack/pacer@0.3.0

## 0.2.0

### Minor Changes

- - updated to use new `@tanstack/pacer` package with all of its breaking changes ([`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16))

### Patch Changes

- Updated dependencies [[`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16)]:
  - @tanstack/pacer@0.2.0

## 0.1.0

### Minor Changes

- feat: Initial release ([#2](https://github.com/TanStack/pacer/pull/2))

### Patch Changes

- Updated dependencies [[`4559434`](https://github.com/TanStack/pacer/commit/4559434d61a06cdfb091e1243d23349c3d909222)]:
  - @tanstack/pacer@0.1.0
