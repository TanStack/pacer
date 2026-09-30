---
'@tanstack/pacer': patch
'@tanstack/pacer-devtools': patch
---

Let late-mounted devtools discover existing keyed utilities and observe later updates after event transport reconnect attempts stop. Isolate observer failures, unsubscribe panels on cleanup, and keep each panel's state separate. Retain event-bus support for older core packages without the subscription API.
