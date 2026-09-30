---
'@tanstack/pacer': patch
---

Distinguish successful retry results from failed, disabled, and aborted executions in all async utilities. Preserve the last successful result on non-success outcomes, report swallowed final failures through the parent's error handling, and retain successful `undefined` results. The parent's `throwOnError` now controls rejection after a swallowed retryer failure. Parent utilities treat retryer timeouts as cancellation. Standalone retryer return values and error handling remain unchanged.
