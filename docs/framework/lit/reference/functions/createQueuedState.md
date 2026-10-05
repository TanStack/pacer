---
id: createQueuedState
title: createQueuedState
---

```ts
function createQueuedState<TValue, TSelected>(
   host,
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, LitQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedState.ts:35](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuedState.ts#L35)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, addItem, queue]. Call itemsAccessor() to read pending items.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### host

`ReactiveControllerHost`

### fn

(`item`) => `void`

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`LitQueuer`](../interfaces/LitQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createQueuedState } from '@tanstack/lit-pacer'

// In a LitElement constructor:
const [items, addItem, queue] = createQueuedState(this, (item: number) => { console.log(item) }, { wait: 500 })
addItem(1)
console.log(items())
```

## See

createQueuer
