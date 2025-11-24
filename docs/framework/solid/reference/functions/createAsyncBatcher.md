---
id: createAsyncBatcher
title: createAsyncBatcher
---

# Function: createAsyncBatcher()

```ts
function createAsyncBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): SolidAsyncBatcher<TValue, TSelected>;
```

Defined in: [solid-pacer/src/async-batcher/createAsyncBatcher.ts:129](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-batcher/createAsyncBatcher.ts#L129)

Creates a Solid-compatible AsyncBatcher instance for managing asynchronous batches of items, exposing Solid signals for all stateful properties.

This is the async version of the createBatcher hook. Unlike the sync version, this async batcher:
- Handles promises and returns results from batch executions
- Provides error handling with configurable error behavior
- Tracks success, error, and settle counts separately
- Has state tracking for when batches are executing
- Returns the result of the batch function execution

Features:
- Configurable batch size and wait time
- Custom batch processing logic via getShouldExecute
- Event callbacks for monitoring batch operations
- Error handling for failed batch operations
- Automatic or manual batch processing
- All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity

The batcher collects items and processes them in batches based on:
- Maximum batch size (number of items per batch)
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

Error Handling:
- If an `onError` handler is provided, it will be called with the error and batcher instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together; the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncBatcher instance

## State Management and Selector

The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
to specify which state changes will trigger a re-render, optimizing performance by preventing
unnecessary re-renders when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary re-renders and gives you
full control over when your component updates. Only when you provide a selector will the
component re-render when the selected state values change.

Available state properties:
- `errorCount`: Number of failed batch executions
- `executionCount`: Total number of batch execution attempts (successful + failed)
- `hasError`: Whether the last batch execution resulted in an error
- `isExecuting`: Whether a batch execution is currently in progress
- `items`: Array of items currently queued for batching
- `lastError`: The error from the most recent failed batch execution (if any)
- `lastResult`: The result from the most recent successful batch execution
- `settleCount`: Number of batch executions that have completed (successful or failed)
- `successCount`: Number of successful batch executions

Example usage:
```tsx
// Default behavior - no reactive state subscriptions
const asyncBatcher = createAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  {
    maxSize: 10,
    wait: 2000,
    onSuccess: (result) => {
      console.log('Batch processed successfully:', result);
    },
    onError: (error) => {
      console.error('Batch processing failed:', error);
    }
  }
);

// Opt-in to re-render when items or isExecuting changes (optimized for UI updates)
const asyncBatcher = createAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  { maxSize: 10, wait: 2000 },
  (state) => ({ items: state.items, isExecuting: state.isExecuting })
);

// Opt-in to re-render when error state changes (optimized for error handling)
const asyncBatcher = createAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  { maxSize: 10, wait: 2000 },
  (state) => ({ hasError: state.hasError, lastError: state.lastError })
);

// Add items to batch
asyncBatcher.addItem(newItem);

// Manually execute batch
const result = await asyncBatcher.execute();

// Access the selected state (will be empty object {} unless selector provided)
const { items, isExecuting } = asyncBatcher.state();
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`items`) => `Promise`\<`any`\>

### options

`AsyncBatcherOptions`\<`TValue`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`SolidAsyncBatcher`](../../interfaces/SolidAsyncBatcher.md)\<`TValue`, `TSelected`\>
