---
id: useBatcher
title: useBatcher
---

```ts
function useBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): OctaneBatcher<TValue, TSelected>;
```

Defined in: [batcher/useBatcher.ts:47](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatcher.ts#L47)

Creates a Octane Batcher with reactive options and automatic owner cleanup.

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

(`items`) => `void`

Function executed by the utility.

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneBatcherOptions`](../interfaces/OctaneBatcherOptions.md)\<`TValue`, `TSelected`\>\>

Core options and an optional cleanup callback.

### selector?

(`state`) => `TSelected`

Selects the state consumed by the component.

## Returns

[`OctaneBatcher`](../interfaces/OctaneBatcher.md)\<`TValue`, `TSelected`\>

The utility instance with reactive selected state.
