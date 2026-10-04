---
id: createQueuedValue
title: createQueuedValue
---

```ts
function createQueuedValue<TValue, TSelected>(
   host,
   source,
   options?,
   selector?): [CellValue<TValue>, LitQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuedValue.ts#L9)

Processes source changes in queue order and returns the last processed value.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

### source

`ValueSource`\<`TValue`\>

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitQueuer`](../interfaces/LitQueuer.md)\<`TValue`, `TSelected`\>\]
