---
id: useAsyncQueuedState
title: useAsyncQueuedState
---

```ts
function useAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [TValue[], OctaneAsyncQueuer<TValue, TSelected>];
```

Defined in: [async-queuer/useAsyncQueuedState.ts:10](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuedState.ts#L10)

Returns pending queue items and their utility. Items are selected by default.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Parameters

### fn

(`value`) => `Promise`\<`any`\>

### options?

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncQueuerOptions`](../interfaces/OctaneAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`[], [`OctaneAsyncQueuer`](../interfaces/OctaneAsyncQueuer.md)\<`TValue`, `TSelected`\>\]
