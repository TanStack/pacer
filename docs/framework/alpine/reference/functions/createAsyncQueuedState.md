---
id: createAsyncQueuedState
title: createAsyncQueuedState
---

```ts
function createAsyncQueuedState<TValue, TSelected>(
   scope,
   fn,
   options?,
   selector?): [() => TValue[], AlpineAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/createAsyncQueuedState.ts:38](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuedState.ts#L38)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, queue]. Call itemsAccessor() to read pending items. Call queue.addItem() to enqueue; there is no separate setter tuple entry.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

(`item`) => `Promise`\<`any`\>

### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncQueuerOptions`](../interfaces/AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], [`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createAsyncQueuedState } from '@tanstack/alpine-pacer'

// scope belongs to the current Alpine component.
const [items, queue] = createAsyncQueuedState(scope, async (item: number) => { console.log(item) }, { wait: 500 })
queue.addItem(1)
console.log(items())
```

## See

createAsyncQueuer
