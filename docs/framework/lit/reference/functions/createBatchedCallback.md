---
id: createBatchedCallback
title: createBatchedCallback
---

```ts
function createBatchedCallback<TValue>(
   host,
   fn,
   options): (item) => void;
```

Defined in: [batcher/createBatchedCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/batcher/createBatchedCallback.ts#L9)

Returns a stable batched callback with the same options and cleanup as createBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### host

`ReactiveControllerHost`

### fn

(`items`) => `void`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitBatcherOptions`](../interfaces/LitBatcherOptions.md)\<`TValue`, \{
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
