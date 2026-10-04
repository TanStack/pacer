---
id: createQueuedValue
title: createQueuedValue
---

```ts
function createQueuedValue<TValue, TSelected>(
   scope,
   source,
   options?,
   selector?): [CellValue<TValue>, AlpineQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuedValue.ts#L9)

Processes source changes in queue order and returns the last processed value.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### source

`ValueSource`\<`TValue`\>

### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]
