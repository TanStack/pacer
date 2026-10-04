---
id: createQueuedValue
title: createQueuedValue
---

```ts
function createQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [CellValue<TValue>, SvelteQueuer<TValue, TSelected>];
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuedValue.ts#L8)

Processes source changes in queue order and returns the last processed value.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### source

`ValueSource`\<`TValue`\>

### options?

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteQueuerOptions`](../interfaces/SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteQueuer`](../interfaces/SvelteQueuer.md)\<`TValue`, `TSelected`\>\]
