---
'@tanstack/pacer': patch
'@tanstack/react-pacer': patch
'@tanstack/preact-pacer': patch
---

fix: async utility return types no longer double-wrap promises. `maybeExecute`, `flush`, `lastResult` state, and `onSuccess` callbacks on AsyncDebouncer, AsyncThrottler, and AsyncRateLimiter (and the `asyncDebounce`/`asyncThrottle`/`asyncRateLimit` helpers) now use `Awaited<ReturnType<TFn>>` instead of `ReturnType<TFn>`. The `useAsyncDebouncedCallback`, `useAsyncThrottledCallback`, and `useAsyncRateLimitedCallback` hooks in react-pacer and preact-pacer now return `Promise<Awaited<ReturnType<TFn>> | undefined>`, matching the angular adapter and the actual runtime behavior (fixes #156)
