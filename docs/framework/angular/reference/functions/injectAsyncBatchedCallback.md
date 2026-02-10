---
id: injectAsyncBatchedCallback
title: injectAsyncBatchedCallback
---

# Function: injectAsyncBatchedCallback()

```ts
function injectAsyncBatchedCallback<TValue>(fn, options): (item) => Promise<void>;
```

Defined in: [async-batcher/injectAsyncBatchedCallback.ts:42](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatchedCallback.ts#L42)

An Angular function that creates an async batched version of a callback function.
This function is essentially a wrapper around `injectAsyncBatcher` that provides
a simplified API for basic async batching needs.

The batched function will collect items and process them in batches asynchronously based on
the configured conditions (maxSize, wait time, etc.).

This function provides a simpler API compared to `injectAsyncBatcher`, making it ideal for basic
async batching needs. However, it does not expose the underlying AsyncBatcher instance.

For advanced usage requiring features like:
- Manual flushing
- Access to batch state
- Error handling callbacks
- Retry support

Consider using the `injectAsyncBatcher` function instead.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

`AsyncBatcherOptions`\<`TValue`\>

## Returns

```ts
(item): Promise<void>;
```

### Parameters

#### item

`TValue`

### Returns

`Promise`\<`void`\>

## Example

```ts
// Batch async API calls
const batchApiCall = injectAsyncBatchedCallback(
  async (items: Array<Data>) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
    return response.json();
  },
  { maxSize: 10, wait: 1000 }
);

// Items will be batched and sent together
await batchApiCall(data1);
await batchApiCall(data2);
```
