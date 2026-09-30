---
'@tanstack/pacer': patch
---

Keep overlapping async executions separate. Preserve newer debounced calls, return each running caller's own result, prevent duplicate flushes, and retain active abort signals and execution state. Keep active batches, debounced calls, and throttled calls abortable across reset without letting an older completion remove a newer execution. Allow newly queued items to use free concurrency slots while preserving scheduled wait delays.
