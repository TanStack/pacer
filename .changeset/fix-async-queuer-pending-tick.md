---
'@tanstack/pacer': patch
---

fix(async-queuer): keep pendingTick true during wait period

When `addItem()` is called on a running queue during the wait period, it checks `isRunning && !pendingTick` to decide whether to trigger `#tick()`. Previously, `pendingTick` was set to `false` synchronously at the end of `#tick()`, even when async work was still pending. This caused `addItem()` to trigger immediate processing that bypassed the configured `wait` delay.

This fix tracks whether async work was scheduled and only clears `pendingTick` when no async work is pending.
