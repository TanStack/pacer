---
id: createBatchedCallback
title: createBatchedCallback
---

```ts
function createBatchedCallback<TValue>(fn, options): (item) => void;
```

Defined in: [packages/svelte-pacer/src/batcher/createBatchedCallback.ts:8](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/batcher/createBatchedCallback.ts#L8)

Returns a stable batched callback with the same options and cleanup as createBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteBatcherOptions`](../interfaces/SvelteBatcherOptions.md)\<`TValue`, \{
\}\>\>

## Returns

```ts
(item): void;
```

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

### Parameters

#### item

`TValue`

### Returns

`void`
