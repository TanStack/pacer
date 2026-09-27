---
'@tanstack/pacer': minor
'@tanstack/pacer-devtools': patch
---

breaking: rename `executeCount` to `executionCount` in `AsyncBatcherState` and `AsyncQueuerState` for consistency with all other utilities (`BatcherState`, `QueuerState`, `DebouncerState`, `ThrottlerState`, `RateLimiterState`, and `AsyncRetryerState` all use `executionCount`). The `getAbortSignal(executionCount?)` parameter on AsyncBatcher and AsyncQueuer is renamed accordingly. Pure rename, no behavior change — update any state selectors, `initialState` values, or callbacks reading `executeCount` to use `executionCount` (fixes #253)

Also rename `AsyncQueuerState.settledCount` to `settleCount` to match the other async utilities. Update state selectors, `initialState`, and callbacks using the old name. Devtools now correctly calculates async queue reduction with both the new name and older Pacer releases. Async batch reduction includes failed items so mixed outcomes do not produce negative percentages. Correct framework examples to use the available state fields and methods.
