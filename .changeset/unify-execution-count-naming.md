---
'@tanstack/pacer': minor
---

breaking: rename `executeCount` to `executionCount` in `AsyncBatcherState` and `AsyncQueuerState` for consistency with all other utilities (`BatcherState`, `QueuerState`, `DebouncerState`, `ThrottlerState`, `RateLimiterState`, and `AsyncRetryerState` all use `executionCount`). The `getAbortSignal(executionCount?)` parameter on AsyncBatcher and AsyncQueuer is renamed accordingly. Pure rename, no behavior change — update any state selectors, `initialState` values, or callbacks reading `executeCount` to use `executionCount` (fixes #253)
