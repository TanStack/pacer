---
id: useAsyncQueuedState
title: useAsyncQueuedState
---

```ts
function useAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], VueAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/useAsyncQueuedState.ts:34](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuedState.ts#L34)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, queue]. Call itemsAccessor() to read pending items. Call queue.addItem() to enqueue; there is no separate setter tuple entry.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`item`) => `Promise`\<`any`\>

### options?

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueAsyncQueuerOptions`](../interfaces/VueAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], [`VueAsyncQueuer`](../interfaces/VueAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { useAsyncQueuedState } from '@tanstack/vue-pacer'

// During component setup:
const [items, queue] = useAsyncQueuedState(async (item: number) => { console.log(item) }, { wait: 500 })
queue.addItem(1)
console.log(items())
```

## See

useAsyncQueuer
