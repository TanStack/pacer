---
id: createRateLimiter
title: createRateLimiter
---

```ts
function createRateLimiter<TFn, TSelected>(
   scope,
   fn,
   options,
selector?): AlpineRateLimiter<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:50](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L50)

Creates an Alpine RateLimiter with reactive options and automatic owner cleanup.

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

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

`TFn`

Function executed by the utility.

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

The utility instance with reactive selected state.
