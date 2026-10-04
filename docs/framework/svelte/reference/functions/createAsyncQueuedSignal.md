---
id: createAsyncQueuedSignal
title: createAsyncQueuedSignal
---

```ts
function createAsyncQueuedSignal<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, SvelteAsyncQueuer<TValue, TSelected>];
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuedSignal.ts:9](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuedSignal.ts#L9)

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncQueuerOptions`](../interfaces/SvelteAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`SvelteAsyncQueuer`](../interfaces/SvelteAsyncQueuer.md)\<`TValue`, `TSelected`\>\]
