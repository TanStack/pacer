---
'@tanstack/pacer': minor
'@tanstack/angular-pacer': minor
---

Expose Debouncer getIsScheduled() for actual trailing timer ownership independently of resettable state. Release suppressed or failed timer executions and preserve calls scheduled reentrantly during timer callbacks or flush().

Keep Angular stability pending across synchronous debounce reset and reactive trailing changes, read the latest cleanup policy at disposal, accept Angular cleanup options in managed signal helpers, and compare selected state shallowly like React and Solid.
