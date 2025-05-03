---
'@tanstack/solid-pacer': minor
---

- breaking: renamed `useQueuerState` hook to `useQueuedState`
- breaking: changed return signature of `useQueuedState` to include the `addItem` function
- breaking: changed return signature of `createDebouncedValue` to return a single value and not a tuple
- feat: add `useQueuedValue` hook
