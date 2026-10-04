---
id: createRateLimiter
title: createRateLimiter
---

```ts
function createRateLimiter<TFn, TSelected>(
   host,
   fn,
   options,
selector?): LitRateLimiter<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:48](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L48)

Creates a Lit RateLimiter with reactive options and automatic owner cleanup.

Pass an options object with property getters or a factory. Only top-level properties
are evaluated; function-valued core options remain callbacks. Local options override
provider defaults. Options update the same instance, preserving pending work and counters.

Pass a selector to subscribe to the state your UI reads. The core store remains available
for additional subscriptions. Cleanup uses the latest onUnmount option, or the core's
default cancellation/stop behavior, including aborting active asynchronous work.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

### fn

`TFn`

Function executed by the utility.

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`LitRateLimiter`](../interfaces/LitRateLimiter.md)\<`TFn`, `TSelected`\>

The utility instance with reactive selected state.
