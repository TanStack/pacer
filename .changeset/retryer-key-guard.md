---
'@tanstack/pacer': patch
---

fix: remove the devtools event-client integration from AsyncRetryer to fix unbounded memory growth (#198). Retryer instances are created per-execution by AsyncQueuer, AsyncDebouncer, AsyncThrottler, and AsyncRateLimiter, so every execution permanently accumulated a devtools event listener, a live instance in the devtools registry (keyed `"<key>-retryer-N"`, or `"undefined-retryer-N"` when the parent had no key), and queued devtools events — most visibly as a memory leak in Node.js. The devtools panel never consumed retryer events, so no devtools functionality is lost. The `key` option on AsyncRetryer remains as a plain identifier, and internal retryers now receive `asyncRetryerOptions` unmodified
