---
'@tanstack/pacer': patch
---

Only run the devtools integration when `process.env.NODE_ENV === 'development'`, matching `@tanstack/devtools-event-client`. Keyed utils no longer register, clone state or subscribe to devtools events in production, and production bundles can now tree-shake the pacer event client and `@tanstack/devtools-event-client`.
