---
id: asyncBatch
title: asyncBatch
---

# Function: asyncBatch()

```ts
function asyncBatch<TValue>(fn, options): (item) => Promise<any>;
```

Defined in: [async-batcher.ts:591](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-batcher.ts#L591)

Creates an async batcher that processes items in batches.

Async vs Sync Versions:
The async version provides advanced features over the sync batch function:
- Returns promises that can be awaited for batch results
- Built-in retry support via AsyncRetryer integration
- Abort support to cancel in-flight batch executions
- Cancel support to prevent pending batches from starting
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts)

The sync batch function is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Batching?
Batching is a technique for grouping multiple operations together to be processed as a single unit.

Configuration Options:
- `maxSize`: Maximum number of items per batch (default: Infinity)
- `wait`: Time to wait before processing batch (default: Infinity)
- `getShouldExecute`: Custom logic to trigger batch processing
- `asyncRetryerOptions`: Configure retry behavior for batch executions
- `started`: Whether to start processing immediately (default: true)

Error Handling:
- If an `onError` handler is provided, it will be called with the error, the batch of items that failed, and batcher instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncBatcher instance

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the async batcher
- Use `onSuccess` callback to react to successful batch execution and implement custom logic
- Use `onError` callback to react to batch execution errors and implement custom error handling
- Use `onSettled` callback to react to batch execution completion (success or error) and implement custom logic
- Use `onItemsChange` callback to react to items being added or removed from the batcher
- The state includes total items processed, success/error counts, and execution status
- State can be accessed via the underlying AsyncBatcher instance's `store.state` property
- When using framework adapters (React/Solid), state is accessed from the hook's state property

## Type Parameters

### TValue

`TValue`

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

[`AsyncBatcherOptions`](../interfaces/AsyncBatcherOptions.md)\<`TValue`\>

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

## Example

```ts
const batchItems = asyncBatch<number>(
  async (items) => {
    const result = await processApiCall(items);
    console.log('Processing:', items);
    return result;
  },
  {
    maxSize: 3,
    wait: 1000,
    onSuccess: (result) => console.log('Batch succeeded:', result),
    onError: (error) => console.error('Batch failed:', error)
  }
);

batchItems(1);
batchItems(2);
batchItems(3); // Triggers batch processing
```
