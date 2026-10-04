---
id: useQueuedValue
title: useQueuedValue
---

```ts
function useQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [TValue, OctaneQueuer<TValue, TSelected>];
```

Defined in: [queuer/useQueuedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuedValue.ts#L9)

Processes render values in queue order and returns the last processed value and queue.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### source

`TValue`

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneQueuerOptions`](../interfaces/OctaneQueuerOptions.md)\<`TValue`, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneQueuer`](../interfaces/OctaneQueuer.md)\<`TValue`, `TSelected`\>\]
