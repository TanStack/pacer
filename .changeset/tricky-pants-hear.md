---
'@tanstack/pacer': minor
---

- feat: add queuer expiration feature to `AsyncQueuer` and `Queuer`
- feat: add return values and types to `AsyncDebouncer`
- feat: standardize `onSuccess`, `onSettled`, and `onError` in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- breaking: rename `onExecute` to `onSettled` in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncRateLimiter`
- breaking: Set `started` to `true` by default in `AsyncQueuer` and `Queuer`
- breaking: Simplified generics to just use `TFn` instead of `TFn, TArgs` in debouncers, throttlers, and rate limiters
- fix: fixed leading and trailing edge behavior of `Debouncer` and `AsyncDebouncer`
