---
id: createAsyncQueuedState
title: createAsyncQueuedState
---

```ts
function createAsyncQueuedState<TValue, TSelected>(
   host,
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, LitAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/createAsyncQueuedState.ts:7](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuedState.ts#L7)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### host

`ReactiveControllerHost`

### fn

(`item`) => `Promise`\<`any`\>

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncQueuerOptions`](../interfaces/LitAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`LitAsyncQueuer`](../interfaces/LitAsyncQueuer.md)\<`TValue`, `TSelected`\>\]
