# @tanstack/solid-pacer

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

- - breaking: renamed `createQueuerState` hook to `createQueuedState` ([#12](https://github.com/TanStack/pacer/pull/12))
  - breaking: changed return signature of `createQueuedState` to include the `addItem` function
  - feat: add `createQueuedValue` hook

### Patch Changes

- Updated dependencies [[`35efeea`](https://github.com/TanStack/pacer/commit/35efeeab76d54a1479bd158db9b804b60e87d89b)]:
  - @tanstack/pacer@0.3.0

## 0.2.0

### Minor Changes

- - feat: Add Solid JS Adapter ([`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16))

### Patch Changes

- Updated dependencies [[`19cee99`](https://github.com/TanStack/pacer/commit/19cee995d79bc16077c9a28fc5f6ab251d626e16)]:
  - @tanstack/pacer@0.2.0

## 0.1.0

### Minor Changes

- feat: Initial release ([#2](https://github.com/TanStack/pacer/pull/2))

### Patch Changes

- Updated dependencies [[`4559434`](https://github.com/TanStack/pacer/commit/4559434d61a06cdfb091e1243d23349c3d909222)]:
  - @tanstack/pacer@0.1.0
