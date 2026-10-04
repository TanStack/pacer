---
id: useAsyncQueuer
title: useAsyncQueuer
---

```ts
function useAsyncQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): VueAsyncQueuer<TValue, TSelected>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:50](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L50)

Creates a Vue AsyncQueuer with reactive options and automatic owner cleanup.

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

(`item`) => `Promise`\<`any`\>

Function executed by the utility.

### options?

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueAsyncQueuerOptions`](../interfaces/VueAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`VueAsyncQueuer`](../interfaces/VueAsyncQueuer.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
