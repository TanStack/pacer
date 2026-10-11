---
id: useQueuedState
title: useQueuedState
---

```ts
function useQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [TValue[], (item, position?, runOnItemsChange?) => boolean, OctaneQueuer<TValue, TSelected>];
```

Defined in: [queuer/useQueuedState.ts:35](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuedState.ts#L35)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [items, addItem, queue].

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`value`) => `void`

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneQueuerOptions`](../interfaces/OctaneQueuerOptions.md)\<`TValue`, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`OctaneQueuer`](../interfaces/OctaneQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { useQueuedState } from '@tanstack/octane-pacer'

// During component rendering:
const [items, addItem, queue] = useQueuedState((item: number) => { console.log(item) }, { wait: 500 })
addItem(1)
// Read items during rendering.
```

## See

useQueuer
