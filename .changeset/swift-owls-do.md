---
'@tanstack/pacer': patch
---

fix(async-debouncer, async-throttler, async-batcher): stop AsyncDebouncer dropping a call made while the previous execution is still running, resolve each caller with its own execution's result instead of a stale one, stop `flush()` running a trailing execution a second time while it is already running, report `status: 'executing'` instead of `'pending'` during a trailing execution, and keep `isExecuting` true in AsyncDebouncer, AsyncThrottler and AsyncBatcher until all overlapping executions settle
