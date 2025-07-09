---
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
'@tanstack/pacer': minor
---

- Rewrote TanStack Pacer to use TanStack Store for state management
- Removed most "get" methods that can now be read directly from the state (e.g. `debouncer.getExecutionCount()` -> `debouncer.store.state.executionCount` or `debouncer.state.executionCount` in framework adapters)
- Added `flush` methods to all utils to trigger pending executions to execute immediately.
