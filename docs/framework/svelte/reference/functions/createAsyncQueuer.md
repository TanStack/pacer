---
id: createAsyncQueuer
title: createAsyncQueuer
---

```ts
function createAsyncQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): SvelteAsyncQueuer<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:49](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L49)

Creates a Svelte AsyncQueuer with reactive options and automatic owner cleanup.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncQueuerOptions`](../interfaces/SvelteAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`SvelteAsyncQueuer`](../interfaces/SvelteAsyncQueuer.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
