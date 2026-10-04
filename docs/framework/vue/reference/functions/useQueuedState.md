---
id: useQueuedState
title: useQueuedState
---

```ts
function useQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, VueQueuer<TValue, TSelected>];
```

Defined in: [queuer/useQueuedState.ts:34](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuedState.ts#L34)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, addItem, queue]. Call itemsAccessor() to read pending items.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`item`) => `void`

### options?

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueQueuerOptions`](../interfaces/VueQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`VueQueuer`](../interfaces/VueQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { useQueuedState } from '@tanstack/vue-pacer'

// During component setup:
const [items, addItem, queue] = useQueuedState((item: number) => { console.log(item) }, { wait: 500 })
addItem(1)
console.log(items())
```

## See

useQueuer
