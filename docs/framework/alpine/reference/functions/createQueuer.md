---
id: createQueuer
title: createQueuer
---

```ts
function createQueuer<TValue, TSelected>(
   scope,
   fn,
   options?,
selector?): AlpineQueuer<TValue, TSelected>;
```

Defined in: [queuer/createQueuer.ts:43](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L43)

Creates an Alpine Queuer with reactive options and automatic owner cleanup.

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

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

(`item`) => `void`

Function executed by the utility.

### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
