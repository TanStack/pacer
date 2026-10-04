---
id: useQueuedValue
title: useQueuedValue
---

```ts
function useQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [Readonly<ShallowRef<TValue>>, VueQueuer<TValue, TSelected>];
```

Defined in: [queuer/useQueuedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuedValue.ts#L8)

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueQueuerOptions`](../interfaces/VueQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, [`VueQueuer`](../interfaces/VueQueuer.md)\<`TValue`, `TSelected`\>\]
