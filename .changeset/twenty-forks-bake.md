---
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
'@tanstack/pacer': minor
---

feat: New `Batcher` Utility to batch process items
fix: Fixed `AsyncDebouncer` and `AsyncThrottler` to resolve previous promises on new executions
breaking: `Queuer` and `AsyncQueuer` have new required `fn` parameter before the `options` parameter to match other utilities and removed `onGetNextItem` option
breaking: `Queuer` and `AsyncQueuer` now use `execute` method instead instead of `getNextItem`, but both methods are now public
breaking: For the `AsyncQueuer`, you now add items instead of functions to the AsyncQueuer. The `fn` parameter is now the function to execute for each item.
