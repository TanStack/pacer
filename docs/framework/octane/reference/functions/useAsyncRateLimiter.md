---
id: useAsyncRateLimiter
title: useAsyncRateLimiter
---

```ts
function useAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): OctaneAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:52](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L52)

Creates a Octane AsyncRateLimiter with reactive options and automatic owner cleanup.

Pass an options object with property getters or a factory. Only top-level properties
are evaluated; function-valued core options remain callbacks. Local options override
provider defaults. Options update the same instance, preserving pending work and counters.

Pass a selector to subscribe to the state your UI reads. The core store remains available
for additional subscriptions. Cleanup uses the latest onUnmount option, or the core's
default cancellation/stop behavior, including aborting active asynchronous work.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

Function executed by the utility.

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncRateLimiterOptions`](../interfaces/OctaneAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`OctaneAsyncRateLimiter`](../interfaces/OctaneAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

The utility instance with reactive selected state.
