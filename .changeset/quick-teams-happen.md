---
'@tanstack/react-pacer': minor
'@tanstack/solid-pacer': minor
'@tanstack/pacer': minor
---

- breaking: Removed most "get" methods that can now be read directly from the state (e.g. `debouncer.getExecutionCount()` -> `debouncer.store.state.executionCount` or `debouncer.state.executionCount` in framework adapters)
- breaking: Removed `getOptions` and other option resolver methods such as `getEnabled` and `getWait`
- feat: Rewrote TanStack Pacer to use TanStack Store for state management
- feat: Added `flush` methods to all utils to trigger pending executions to execute immediately.
- feat: Added an `initialState` option to all utils to set the initial state for persistence features
- feat: Added status state to all utils except rate-limiters for pending, excution, etc. states.
- feat: Added new AsyncBatcher utility
- fix: Multiple bug fixes
