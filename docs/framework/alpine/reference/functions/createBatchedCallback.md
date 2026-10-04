---
id: createBatchedCallback
title: createBatchedCallback
---

```ts
function createBatchedCallback<TValue>(
   scope,
   fn,
   options): (item) => void;
```

Defined in: [batcher/createBatchedCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatchedCallback.ts#L9)

Returns a stable batched callback with the same options and cleanup as createBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

(`items`) => `void`

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineBatcherOptions`](../interfaces/AlpineBatcherOptions.md)\<`TValue`, \{
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
