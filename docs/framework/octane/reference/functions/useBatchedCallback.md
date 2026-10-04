---
id: useBatchedCallback
title: useBatchedCallback
---

```ts
function useBatchedCallback<TValue>(fn, options): (item) => void;
```

Defined in: [batcher/useBatchedCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/batcher/useBatchedCallback.ts#L9)

Returns a stable batched callback with the same options and cleanup as useBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneBatcherOptions`](../interfaces/OctaneBatcherOptions.md)\<`TValue`, \{
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
