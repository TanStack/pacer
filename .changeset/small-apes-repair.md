---
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
'@tanstack/pacer': minor
---

breaking: remove `onError`, `onSuccess`, `onSettled` options from `AsyncQueuer` in favor of options of the same name on the `AsyncQueuer`
feat: standardize error handling callbacks on `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`
feat: add `throwOnError` option to `AsyncQueuer`, `AsyncDebouncer`, `AsyncRateLimiter`, and `AsyncThrottler`
