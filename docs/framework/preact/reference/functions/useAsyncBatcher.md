---
id: useAsyncBatcher
title: useAsyncBatcher
---

# Function: useAsyncBatcher()

```ts
function useAsyncBatcher<TValue, TSelected>(
   fn, 
   options, 
selector): PreactAsyncBatcher<TValue, TSelected>;
```

Defined in: [preact-pacer/src/async-batcher/useAsyncBatcher.ts:234](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-batcher/useAsyncBatcher.ts#L234)

A Preact hook that creates an `AsyncBatcher` instance for managing asynchronous batches of items.

This is the async version of the useBatcher hook. Unlike the sync version, this async batcher:
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

The batcher collects items and processes them in batches based on:
- Maximum batch size (number of items per batch)
- Time-based batching (process after X milliseconds)
- Custom batch processing logic via getShouldExecute

Error Handling:
- If an `onError` handler is provided, it will be called with the error and batcher instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncBatcher instance

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `batcher.Subscribe` HOC (Recommended for component tree subscriptions)**

Use the `Subscribe` HOC to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger a re-render
at the hook level, optimizing performance by preventing unnecessary re-renders when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` HOC. This prevents unnecessary
re-renders and gives you full control over when your component updates.

Available state properties:
- `errorCount`: Number of batch executions that have resulted in errors
- `failedItems`: Array of items that failed during batch processing
- `isEmpty`: Whether the batcher has no items to process
- `isExecuting`: Whether a batch is currently being processed asynchronously
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `isRunning`: Whether the batcher is active and will process items automatically
- `items`: Array of items currently queued for batch processing
- `lastResult`: The result from the most recent batch execution
- `settleCount`: Number of batch executions that have completed (success or error)
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending' | 'executing' | 'populated')
- `successCount`: Number of batch executions that have completed successfully
- `totalItemsProcessed`: Total number of items processed across all batches
- `totalItemsFailed`: Total number of items that have failed processing

## Unmount behavior

By default, the hook cancels any pending batch when the component unmounts.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```tsx
const batcher = useAsyncBatcher(fn, {
  maxSize: 10,
  wait: 2000,
  onUnmount: (b) => b.flush()
});
```

Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
If your batch function updates Preact state, those updates may run after the component has
unmounted, which can cause "setState on unmounted component" warnings. Guard your callbacks
accordingly when using onUnmount with flush.

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

[`PreactAsyncBatcherOptions`](../interfaces/PreactAsyncBatcherOptions.md)\<`TValue`, `TSelected`\> = `{}`

### selector

(`state`) => `TSelected`

## Returns

[`PreactAsyncBatcher`](../interfaces/PreactAsyncBatcher.md)\<`TValue`, `TSelected`\>

## Example

```tsx
// Basic async batcher for API requests - no reactive state subscriptions
const asyncBatcher = useAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  { maxSize: 10, wait: 2000 }
);

// Subscribe to state changes deep in component tree using Subscribe HOC
<asyncBatcher.Subscribe selector={(state) => ({ size: state.size })}>
  {({ size }) => (
    <div>Batch Size: {size}</div>
  )}
</asyncBatcher.Subscribe>

// Opt-in to re-render when execution state changes at hook level (optimized for loading indicators)
const asyncBatcher = useAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  { maxSize: 10, wait: 2000 },
  (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
    status: state.status
  })
);

// Opt-in to re-render when results are available (optimized for data display)
const asyncBatcher = useAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  { maxSize: 10, wait: 2000 },
  (state) => ({
    lastResult: state.lastResult,
    successCount: state.successCount,
    totalItemsProcessed: state.totalItemsProcessed
  })
);

// Opt-in to re-render when error state changes (optimized for error handling)
const asyncBatcher = useAsyncBatcher(
  async (items) => {
    const results = await Promise.all(items.map(item => processItem(item)));
    return results;
  },
  {
    maxSize: 10,
    wait: 2000,
    onError: (error) => console.error('Batch processing failed:', error)
  },
  (state) => ({
    errorCount: state.errorCount,
    failedItems: state.failedItems,
    totalItemsFailed: state.totalItemsFailed
  })
);

// Complete example with all callbacks
const asyncBatcher = useAsyncBatcher(
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

// Add items to batch
asyncBatcher.addItem(newItem);

// Manually execute batch
const result = await asyncBatcher.execute();

// Access the selected state (will be empty object {} unless selector provided)
const { isExecuting, lastResult, size } = asyncBatcher.state;
```
