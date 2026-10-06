---
'@tanstack/pacer': patch
---

Fixed a bug in AsyncDebouncer where a scheduled execution is dropped if an in-flight execution completes before it is invoked
