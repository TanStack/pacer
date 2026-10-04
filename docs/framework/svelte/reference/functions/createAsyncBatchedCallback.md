---
id: createAsyncBatchedCallback
title: createAsyncBatchedCallback
---

```ts
function createAsyncBatchedCallback<TValue>(fn, options): (item) => Promise<any>;
```

Defined in: [packages/svelte-pacer/src/async-batcher/createAsyncBatchedCallback.ts:11](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-batcher/createAsyncBatchedCallback.ts#L11)

Returns a stable batched callback with the same options and cleanup as createAsyncBatcher.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncBatcherOptions`](../interfaces/SvelteAsyncBatcherOptions.md)\<`TValue`, \{
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
