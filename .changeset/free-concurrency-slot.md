---
'@tanstack/pacer': patch
---

Fixed `AsyncQueuer.addItem` so a newly added item can fill an available concurrency slot while another item is still running.
