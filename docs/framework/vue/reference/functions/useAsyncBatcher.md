---
id: useAsyncBatcher
title: useAsyncBatcher
---

```ts
function useAsyncBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): VueAsyncBatcher<TValue, TSelected>;
```

Defined in: [async-batcher/useAsyncBatcher.ts:50](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatcher.ts#L50)

Creates a Vue AsyncBatcher with reactive options and automatic owner cleanup.

Pass an options object with property getters or a factory. Only top-level properties
are evaluated; function-valued core options remain callbacks. Local options override
provider defaults. Options update the same instance, preserving pending work and counters.

Pass a selector to subscribe to the state your UI reads. The core store remains available
for additional subscriptions. Cleanup uses the latest onUnmount option, or the core's
default cancellation/stop behavior, including aborting active asynchronous work.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

Function executed by the utility.

### options?

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueAsyncBatcherOptions`](../interfaces/VueAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`VueAsyncBatcher`](../interfaces/VueAsyncBatcher.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
