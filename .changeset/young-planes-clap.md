---
'@tanstack/pacer': patch
---

fix(async-queuer): Fix falsy item handling in AsyncQueuer#tick — items like 0, "", and false are no longer silently dropped from the processing loop.
