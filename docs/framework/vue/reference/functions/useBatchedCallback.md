---
id: useBatchedCallback
title: useBatchedCallback
---

```ts
function useBatchedCallback<TValue>(fn, options): (item) => void;
```

Defined in: [batcher/useBatchedCallback.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/batcher/useBatchedCallback.ts#L8)

Returns a stable batched callback with the same options and cleanup as useBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueBatcherOptions`](../interfaces/VueBatcherOptions.md)\<`TValue`, \{
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
