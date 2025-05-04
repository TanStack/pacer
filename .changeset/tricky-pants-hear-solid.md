---
'@tanstack/solid-pacer': minor
---

- breaking: renamed `createQueuerState` hook to `createQueuedState`
- breaking: changed return signature of `createQueuedState` to include the `addItem` function
- breaking: changed return signature of `createDebouncedValue` to return a single value and not a tuple
- feat: add `createQueuedValue` hook
