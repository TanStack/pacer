---
'@tanstack/pacer': patch
---

Preserve previous queue state snapshots when adding items. Queuer and AsyncQueuer now replace their items and timestamps arrays, allowing subscribers that select queue items to detect additions.
