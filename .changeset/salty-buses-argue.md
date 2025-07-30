---
'@tanstack/pacer': minor
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
---

breaking: changed callback signature of `onError` in AsyncDebouncer, AsyncThrottler, AsyncQueuer, AsyncRatelimiter, and AsyncBatcher to include the item that caused the error
fix: Fixed Error Handling in Async Debouncer and Throttler by properly resolving and rejecting returned promises from `maybeExecute`
