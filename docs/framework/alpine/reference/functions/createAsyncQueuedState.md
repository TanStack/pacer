---
id: createAsyncQueuedState
title: createAsyncQueuedState
---

```ts
function createAsyncQueuedState<TValue, TSelected>(
   scope,
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, AlpineAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/createAsyncQueuedState.ts:10](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuedState.ts#L10)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

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

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>\]
