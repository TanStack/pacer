---
'@tanstack/pacer': minor
---

- feat: add queuer expiration feature to `AsyncQueuer` and `Queuer`
- breaking: Set `started` to `true` by default in `AsyncQueuer` and `Queuer`
- breaking: Simplified generics to just use `TFn` instead of `TFn, TArgs` in debouncers, throttlers, and rate limiters
- fix: fixed leading and trailing edge behavior of `Debouncer`
