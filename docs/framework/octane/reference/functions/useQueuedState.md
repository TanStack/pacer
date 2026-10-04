---
id: useQueuedState
title: useQueuedState
---

```ts
function useQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [TValue[], OctaneQueuer<TValue, TSelected>];
```

Defined in: [queuer/useQueuedState.ts:7](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuedState.ts#L7)

Returns pending queue items and their utility. Items are selected by default.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`value`) => `void`

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneQueuerOptions`](../interfaces/OctaneQueuerOptions.md)\<`TValue`, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`[], [`OctaneQueuer`](../interfaces/OctaneQueuer.md)\<`TValue`, `TSelected`\>\]
