---
id: createQueuer
title: createQueuer
---

```ts
function createQueuer<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): LitQueuer<TValue, TSelected>;
```

Defined in: [queuer/createQueuer.ts:44](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L44)

Creates a Lit Queuer with reactive options and automatic owner cleanup.

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

### host

`ReactiveControllerHost`

### fn

(`item`) => `void`

Function executed by the utility.

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`LitQueuer`](../interfaces/LitQueuer.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
