---
id: createQueuedState
title: createQueuedState
---

```ts
function createQueuedState<TValue, TSelected>(
   host,
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, LitQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedState.ts:7](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuedState.ts#L7)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### host

`ReactiveControllerHost`

### fn

(`item`) => `void`

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`LitQueuer`](../interfaces/LitQueuer.md)\<`TValue`, `TSelected`\>\]
