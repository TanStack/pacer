---
'@tanstack/pacer': patch
---

Keep overlapping async executions separate. Preserve newer debounced calls, return each running caller's own result, prevent duplicate flushes, and retain active abort signals and execution state. Keep active work in async batchers, debouncers, throttlers, queues, and rate limiters abortable across reset without letting an older completion remove a newer execution. Preserve queue concurrency slots across reset and prevent manual executions from releasing another task's slot. Allow newly queued items to use free concurrency slots while preserving scheduled wait delays.
