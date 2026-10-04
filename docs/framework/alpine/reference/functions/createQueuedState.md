---
id: createQueuedState
title: createQueuedState
---

```ts
function createQueuedState<TValue, TSelected>(
   scope,
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, AlpineQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedState.ts:7](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuedState.ts#L7)

Returns pending queue items, the addItem method, and the queue. Items are always selected.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

(`item`) => `void`

### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]
