---
id: createQueuedSignal
title: createQueuedSignal
---

```ts
function createQueuedSignal<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, SvelteQueuer<TValue, TSelected>];
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuedSignal.ts:34](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuedSignal.ts#L34)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [itemsAccessor, addItem, queue]. Call itemsAccessor() to read pending items.

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteQueuerOptions`](../interfaces/SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`SvelteQueuer`](../interfaces/SvelteQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createQueuedSignal } from '@tanstack/svelte-pacer'

// During component initialization:
const [items, addItem, queue] = createQueuedSignal((item: number) => { console.log(item) }, { wait: 500 })
addItem(1)
console.log(items())
```

## See

createQueuer
