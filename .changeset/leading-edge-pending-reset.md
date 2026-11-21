---
'@tanstack/pacer': patch
'@tanstack/pacer-lite': patch
---

Reset pending state and clear stored args after a leading-edge debouncer execution, so status returns to idle and `flush()` does not re-execute an already-handled call. Same fix applied to `LiteDebouncer`.