---
'@tanstack/pacer': minor
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
---

breaking: Removed `isRunning` state from `Batcher` and `AsyncBatcher` utils, and also removed `start` and `stop` methods
breaking: Changed `flush()` method in `AsyncDebouncer`, `AsyncThrottler`, and `AsyncQueuer` to return Promises instead of void
feat: Added `flushAsBatch` methods to the `Queuer` and `AsyncQueuer` utils
feat: Added `isExceeded` and `status` state properties to `RateLimiter` and `AsyncRateLimiter` for better rate limit tracking
feat: Enhanced error handling in `AsyncDebouncer` and `AsyncThrottler` with proper promise rejection support
feat: Improved timeout management in rate limiters with automatic cleanup of expired execution times
