---
'@tanstack/vue-pacer': minor
'@tanstack/svelte-pacer': minor
'@tanstack/lit-pacer': minor
'@tanstack/alpine-pacer': minor
'@tanstack/ember-pacer': minor
'@tanstack/octane-pacer': minor
'@tanstack/vue-pacer-devtools': minor
'@tanstack/svelte-pacer-devtools': minor
'@tanstack/angular-pacer-devtools': minor
'@tanstack/pacer': patch
'@tanstack/react-pacer': patch
'@tanstack/preact-pacer': patch
'@tanstack/solid-pacer': patch
'@tanstack/angular-pacer': minor
'@tanstack/pacer-devtools': minor
'@tanstack/react-pacer-devtools': patch
'@tanstack/preact-pacer-devtools': patch
'@tanstack/solid-pacer-devtools': patch
---

Add Vue, Svelte, Lit, Alpine, Ember, and Octane adapters with reactive options, selected state, child subscriptions, lifecycle cleanup, state and value helpers, and framework guides and examples. Add Vue, Svelte, and Angular devtools integrations and a framework-independent Pacer plugin for the TanStack Devtools host. Update compatible dependencies while retaining TypeScript 6 and the workspace minimum release age.

Lit defaults inherit through the component subtree, including shadow roots, and update descendant utilities when provider options change.

Vue, Svelte, Lit, and Alpine selectors also refresh when their reactive inputs change without a utility store update.

Ember queues process initial items after rendering so their callbacks can update tracked state safely.

Keep callback-only hooks in React, Preact, and Octane. Vue, Svelte, Lit, Alpine, Ember, and Angular use the lifecycle-owned utility methods directly: `maybeExecute` for debouncing, throttling, and rate limiting, and `addItem` for batching. Angular users should replace `inject*Callback(...)` with the corresponding instance factory and call its method from event handlers. Avoid reading methods during field initialization when options depend on required inputs.
