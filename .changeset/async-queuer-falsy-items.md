---
'@tanstack/pacer': patch
---

fix(queuer): stop silently dropping falsy items (`0`, `''`, `false`) from AsyncQueuer processing, and stop throwing a TypeError when `null` items are added to AsyncQueuer or Queuer without a custom `getPriority` (fixes #200)
