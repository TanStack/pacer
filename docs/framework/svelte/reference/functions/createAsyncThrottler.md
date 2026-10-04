---
id: createAsyncThrottler
title: createAsyncThrottler
---

```ts
function createAsyncThrottler<TFn, TSelected>(
   fn,
   options,
selector?): SvelteAsyncThrottler<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts:50](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottler.ts#L50)

Creates a Svelte AsyncThrottler with reactive options and automatic owner cleanup.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncThrottlerOptions`](../interfaces/SvelteAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`SvelteAsyncThrottler`](../interfaces/SvelteAsyncThrottler.md)\<`TFn`, `TSelected`\>

The utility instance with reactive selected state.
