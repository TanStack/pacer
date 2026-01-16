---
id: createBatchedCallback
title: createBatchedCallback
---

# Function: createBatchedCallback()

```ts
function createBatchedCallback<TValue>(fn, options): (item) => void;
```

Defined in: [angular-pacer/src/batcher/createBatchedCallback.ts:40](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/batcher/createBatchedCallback.ts#L40)

An Angular function that creates a batched version of a callback function.
This function is essentially a wrapper around `createBatcher` that provides
a simplified API for basic batching needs.

The batched function will collect items and process them in batches based on
the configured conditions (maxSize, wait time, etc.).

This function provides a simpler API compared to `createBatcher`, making it ideal for basic
batching needs. However, it does not expose the underlying Batcher instance.

For advanced usage requiring features like:
- Manual flushing
- Access to batch state
- State tracking

Consider using the `createBatcher` function instead.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

`BatcherOptions`\<`TValue`\>

## Returns

```ts
(item): void;
```

### Parameters

#### item

`TValue`

### Returns

`void`

## Example

```ts
// Batch API calls
const batchApiCall = createBatchedCallback(
  (items) => {
    return fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(items)
    });
  },
  { maxSize: 10, wait: 1000 }
);

// Items will be batched and sent together
batchApiCall('item1');
batchApiCall('item2');
```
