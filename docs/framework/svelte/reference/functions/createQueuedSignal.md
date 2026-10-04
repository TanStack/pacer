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

Defined in: [packages/svelte-pacer/src/queuer/createQueuedSignal.ts:6](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuedSignal.ts#L6)

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteQueuerOptions`](../interfaces/SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`SvelteQueuer`](../interfaces/SvelteQueuer.md)\<`TValue`, `TSelected`\>\]
