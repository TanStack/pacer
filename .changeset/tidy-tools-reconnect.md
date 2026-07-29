---
'@tanstack/pacer-devtools': patch
'@tanstack/pacer': patch
---

Fix Pacer Devtools discovering utilities and receiving their updates when the
devtools panel mounts after the event client has exhausted its connection
retries.
