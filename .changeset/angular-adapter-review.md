---
'@tanstack/angular-pacer': minor
---

Align Angular utilities with explicit lazy refs and tracked external-store signals. Preserve real Signal types and initial values, apply current options before operations, and isolate imperative callbacks from signal tracking. Own subscriptions, cleanup, scheduled work, and overlapping async executions for Angular stability without a proxy or shared adapter-management abstraction.

Expose core metadata as readonly Angular signals: use `options()`, `key()`, `fn()`, and `store()`, with `setOptions` for explicit updates. Align debounced, throttled, rate-limited, and queued value helpers with the sibling `(source, options, selector?)` API; use the corresponding managed signal helper for an explicit initial value.
