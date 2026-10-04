---
id: createAsyncRateLimiter
title: createAsyncRateLimiter
---

```ts
function createAsyncRateLimiter<TFn, TSelected>(
   scope,
   fn,
   options,
selector?): AlpineAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:50](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L50)

Creates an Alpine AsyncRateLimiter with reactive options and automatic owner cleanup.

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

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

`TFn`

Function executed by the utility.

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncRateLimiterOptions`](../interfaces/AlpineAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`AlpineAsyncRateLimiter`](../interfaces/AlpineAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

The utility instance with reactive selected state.
