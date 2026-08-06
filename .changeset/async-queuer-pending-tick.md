---
'@tanstack/pacer': patch
---

fix(async-queuer): respect the `wait` period when `addItem` is called during active processing. `pendingTick` now stays true while executions or wait timers are pending (matching the sync Queuer's semantics), task errors no longer kill the processing chain or produce unhandled promise rejections during tick-driven processing, and `flush`/`flushAsBatch` restart the tick chain they interrupt (fixes #188)
