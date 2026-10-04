---
id: useAsyncQueuedState
title: useAsyncQueuedState
---

```ts
function useAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, VueAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/useAsyncQueuedState.ts:6](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuedState.ts#L6)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

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

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`VueAsyncQueuer`](../interfaces/VueAsyncQueuer.md)\<`TValue`, `TSelected`\>\]
