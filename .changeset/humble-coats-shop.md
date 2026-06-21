---
'@tanstack/pacer': patch
---

Fixed a bug in AsyncDebouncer where getAbortSignal() incorrectly returned null due to an internal execution ID mismatch. Abort signals can now be properly attached to underlying async tasks.
