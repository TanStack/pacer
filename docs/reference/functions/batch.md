---
id: batch
title: batch
---

# Function: batch()

```ts
function batch<TValue>(fn, options): (item) => void;
```

Defined in: [batcher.ts:322](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/batcher.ts#L322)

Creates a batcher that processes items in batches.

This synchronous version is lighter weight and often all you need - upgrade to asyncBatch when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `void`

### options

[`BatcherOptions`](../../interfaces/BatcherOptions.md)\<`TValue`\>

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

## Example

```ts
const batchItems = batch<number>(
  (items) => console.log('Processing:', items),
  {
    maxSize: 3,
    onExecute: (batch, batcher) => console.log('Batch executed:', batch)
  }
);

batchItems(1);
batchItems(2);
batchItems(3); // Triggers batch processing
```
