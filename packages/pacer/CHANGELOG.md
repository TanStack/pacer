# @tanstack/pacer

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
