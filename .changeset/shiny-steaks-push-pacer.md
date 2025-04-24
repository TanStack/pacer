---
'@tanstack/pacer': minor
---

- feat: Add Solid JS Adapter
- rewrote all instance methods on utilities for reading state to use `get*` naming convention
- added `getOptions` methods to all utilities for reading options
- changed rate limiter's `onReject` signature to match other utilities
- added an `onReject` option to the queuer utilities
- added `onExecute`, `onItemsChanged`, `onIsRunningChanged`, and other callbacks to all utilities
- added `getIsPending` methods to debouncer and throttler
