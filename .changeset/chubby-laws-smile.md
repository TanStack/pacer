---
'@tanstack/react-pacer-devtools': minor
'@tanstack/solid-pacer-devtools': minor
'@tanstack/pacer-devtools': minor
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
'@tanstack/pacer': minor
---

- feat:Added `AsyncRetryer` class and `asyncRetry` function with exponential/linear/fixed backoff strategies, jitter support, timeout controls (`maxExecutionTime`, `maxTotalExecutionTime`), lifecycle callbacks (`onRetry`, `onSuccess`, `onError`, `onLastError`, `onSettled`, `onAbort`, `onExecutionTimeout`, `onTotalExecutionTimeout`), dynamic options, and built-in retry integration via `asyncRetryerOptions` for all async utilities (`AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`)
- feat: Added `getAbortSignal()` method to all async utilities (`AsyncRetryer`, `AsyncBatcher`, `AsyncDebouncer`, `AsyncQueuer`, `AsyncRateLimiter`, `AsyncThrottler`) to enable true cancellation of underlying async operations (like fetch requests) when `abort()` is called
- feat: Added `asyncBatcherOptions`, `asyncDebouncerOptions`, `asyncQueuerOptions`, `asyncRateLimiterOptions`, `asyncRetryerOptions`, `asyncThrottlerOptions`, `debouncerOptions`, `queuerOptions`, `rateLimiterOptions`, `throttlerOptions` utility functions for sharing common options between different pacer utilities
- fix: Fixed async-throtter trailing edge behavior when long executions were awaited.
- breaking: standardized `reset`, `cancel` and `abort` API behaviors with consistent naming and behavior across all async utilities. Canceling no longer aborts, new dedicated `abort` method is provided for aborting ongoing executions.