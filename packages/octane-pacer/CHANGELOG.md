# @tanstack/octane-pacer

## 0.2.0

### Minor Changes

- [#273](https://github.com/TanStack/pacer/pull/273) [`9106856`](https://github.com/TanStack/pacer/commit/91068562cfd0c3107c9eed7496f0764c65921aa5) - Add Vue, Svelte, Lit, Alpine, Ember, and Octane adapters with reactive options, selected state, child subscriptions, lifecycle cleanup, state and value helpers, and framework guides and examples. Add Vue, Svelte, and Angular devtools integrations and a framework-independent Pacer plugin for the TanStack Devtools host. Update compatible dependencies while retaining TypeScript 6 and the workspace minimum release age.

  Lit defaults inherit through the component subtree, including shadow roots, and update descendant utilities when provider options change.

  Vue, Svelte, Lit, and Alpine selectors also refresh when their reactive inputs change without a utility store update.

  Ember queues process initial items after rendering so their callbacks can update tracked state safely.

  Keep callback-only hooks in React, Preact, and Octane. Vue, Svelte, Lit, Alpine, Ember, and Angular use the lifecycle-owned utility methods directly: `maybeExecute` for debouncing, throttling, and rate limiting, and `addItem` for batching. Angular users should replace `inject*Callback(...)` with the corresponding instance factory and call its method from event handlers. Avoid reading methods during field initialization when options depend on required inputs.

### Patch Changes

- Updated dependencies [[`9106856`](https://github.com/TanStack/pacer/commit/91068562cfd0c3107c9eed7496f0764c65921aa5), [`9106856`](https://github.com/TanStack/pacer/commit/91068562cfd0c3107c9eed7496f0764c65921aa5)]:
  - @tanstack/pacer@0.23.1
