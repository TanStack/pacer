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

Defined in: [queuer/useQueuedState.ts:6](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuedState.ts#L6)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

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
