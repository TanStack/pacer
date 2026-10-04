---
id: useAsyncBatchedCallback
title: useAsyncBatchedCallback
---

```ts
function useAsyncBatchedCallback<TValue>(fn, options): (item) => Promise<any>;
```

Defined in: [async-batcher/useAsyncBatchedCallback.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-batcher/useAsyncBatchedCallback.ts#L8)

Returns a stable batched callback with the same options and cleanup as useAsyncBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueAsyncBatcherOptions`](../interfaces/VueAsyncBatcherOptions.md)\<`TValue`, \{
\}\>\>

## Returns

```ts
(item): Promise<any>;
```

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

### Parameters

#### item

`TValue`

### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

### Throws

The error from the batch function if no onError handler is configured or throwOnError is true
