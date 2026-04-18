---
'@tanstack/pacer': patch
---

Guard retryer key propagation in AsyncQueuer, AsyncThrottler, AsyncRateLimiter, and AsyncDebouncer to prevent child AsyncRetryer instances from receiving a truthy key when the parent has no key, which caused unbounded devtools event accumulation and memory leaks in Node.js environments.
