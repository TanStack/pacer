---
'@tanstack/pacer': minor
---

- feat: add queuer expiration feature to `AsyncQueuer` and `Queuer`
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
