---
id: useAsyncQueuedState
title: useAsyncQueuedState
---

```ts
function useAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [TValue[], OctaneAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/useAsyncQueuedState.ts:38](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuedState.ts#L38)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [items, queue]. Call queue.addItem() to enqueue; there is no separate setter tuple entry.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`value`) => `Promise`\<`any`\>

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncQueuerOptions`](../interfaces/OctaneAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`[], [`OctaneAsyncQueuer`](../interfaces/OctaneAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { useAsyncQueuedState } from '@tanstack/octane-pacer'

// During component rendering:
const [items, queue] = useAsyncQueuedState(async (item: number) => { console.log(item) }, { wait: 500 })
queue.addItem(1)
// Read items during rendering.
```

## See

useAsyncQueuer
