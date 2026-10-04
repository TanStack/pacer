---
id: createAsyncQueuedState
title: createAsyncQueuedState
---

```ts
function createAsyncQueuedState<TValue, TSelected>(
   host,
   fn,
   options?,
   selector?): [() => TValue[], LitAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/createAsyncQueuedState.ts:35](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuedState.ts#L35)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, queue]. Call itemsAccessor() to read pending items. Call queue.addItem() to enqueue; there is no separate setter tuple entry.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### host

`ReactiveControllerHost`

### fn

(`item`) => `Promise`\<`any`\>

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncQueuerOptions`](../interfaces/LitAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], [`LitAsyncQueuer`](../interfaces/LitAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createAsyncQueuedState } from '@tanstack/lit-pacer'

// In a LitElement constructor:
const [items, queue] = createAsyncQueuedState(this, async (item: number) => { console.log(item) }, { wait: 500 })
queue.addItem(1)
console.log(items())
```

## See

createAsyncQueuer
