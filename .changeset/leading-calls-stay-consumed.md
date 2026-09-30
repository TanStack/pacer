---
'@tanstack/pacer': patch
'@tanstack/pacer-lite': patch
---

Prevent `flush()` from repeating a call already executed on the leading edge of a debouncer. Keep `Debouncer` pending state idle when no trailing call is waiting, while preserving the leading cooldown and later trailing calls. Apply the same argument handling to `LiteDebouncer`.
