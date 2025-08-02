---
title: Async Batching Guide
id: async-batching
---

All core concepts from the [Batching Guide](../batching.md) apply to async batching as well.

## When to Use Async Batching

While the synchronous batcher works well for many use cases, async batching provides additional capabilities that are particularly useful when:

- You need to capture and use the return value from batch executions
- Your batch processing involves asynchronous operations (API calls, database operations, file I/O)
- You require advanced error handling with configurable error behavior
- You want to track success/error statistics separately
- You need to monitor when batches are actively executing

## Async Batching in TanStack Pacer

TanStack Pacer provides async batching through the `AsyncBatcher` class and the `asyncBatch` function. Unlike the synchronous version, the async batcher handles Promises and provides robust error handling capabilities.

### Basic Usage with `asyncBatch`

The `asyncBatch` function provides a simple way to create an async batching function:

```ts
import { asyncBatch } from '@tanstack/pacer'

const processAsyncBatch = asyncBatch<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 3,
    wait: 2000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch completed successfully:', results)
      console.log('Processed batch:', batch)
      console.log('Total successes:', batcher.store.state.successCount)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
      console.log('Total errors:', batcher.store.state.errorCount)
    }
  }
)

// Add items to be batched
processAsyncBatch(1)
processAsyncBatch(2)
processAsyncBatch(3) // Triggers batch processing
```

> **Note:** When using React, prefer `useAsyncBatchedCallback` hook over the `asyncBatch` function for better integration with React's lifecycle and automatic cleanup.

### Advanced Usage with `AsyncBatcher` Class

For more control over async batch behavior, use the `AsyncBatcher` class directly:

```ts
import { AsyncBatcher } from '@tanstack/pacer'

const batcher = new AsyncBatcher<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 5,
    wait: 3000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
    }
  }
)

// Access current state via TanStack Store
console.log(batcher.store.state.successCount) // Number of successful batch executions
console.log(batcher.store.state.errorCount) // Number of failed batch executions
console.log(batcher.store.state.isExecuting) // Whether a batch is currently executing
console.log(batcher.store.state.lastResult) // Result from most recent batch

// Add items to the batch
batcher.addItem(1)
batcher.addItem(2)

// Control batch execution
batcher.stop()  // Stop processing
batcher.start() // Resume processing
```

## Key Differences from Synchronous Batching

### 1. Return Value Handling

Unlike the synchronous batcher which returns void, the async version allows you to capture and use the return value from your batch function:

```ts
const batcher = new AsyncBatcher<string>(
  async (items) => {
    const results = await processBatch(items)
    return results
  },
  {
    maxSize: 5,
    onSuccess: (results, batch, batcher) => {
      // Handle the returned results
      console.log('Batch results:', results)
      console.log('Processed batch:', batch)
    }
  }
)
```

### 2. Error Handling

The async batcher provides comprehensive error handling capabilities:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might throw an error
    const results = await riskyBatchOperation(items)
    return results
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      // Handle batch errors
      console.error('Batch processing failed:', error)
      console.log('Items that failed:', batch)
      console.log('Total error count:', batcher.store.state.errorCount)
    },
    throwOnError: false, // Don't throw errors, just handle them
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
      console.log('Total success count:', batcher.store.state.successCount)
    },
    onSettled: (batch, batcher) => {
      // Called after every batch (success or failure)
      console.log('Batch settled:', batch)
      console.log('Total batches:', batcher.store.state.settleCount)
    }
  }
)
```

### 3. Execution State Tracking

The async batcher tracks when batches are actively executing:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    console.log('Starting batch execution...')
    const results = await longRunningBatchOperation(items)
    console.log('Batch execution completed')
    return results
  },
  {
    maxSize: 5,
    onItemsChange: (batcher) => {
      console.log('Is executing:', batcher.store.state.isExecuting)
      console.log('Items in queue:', batcher.store.state.size)
    }
  }
)
```

### 4. Different Callbacks

The `AsyncBatcher` supports these async-specific callbacks:

- `onSuccess`: Called after each successful batch execution, providing the result, the batch of items processed, and batcher instance
- `onError`: Called when a batch execution fails, providing the error, the batch of items that failed, and batcher instance
- `onSettled`: Called after each batch execution (success or failure), providing the batch of items processed and batcher instance
- `onExecute`: Called after each batch execution, providing the batch of items processed and batcher instance (same as synchronous batcher)
- `onItemsChange`: Called when items are added or the batch is processed

## Error Handling Options

The async batcher provides flexible error handling through the `throwOnError` option:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might throw an error
    throw new Error('Batch processing failed')
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      console.error('Handling error:', error)
    },
    throwOnError: true, // Will throw errors even with onError handler
    // throwOnError: false, // Will swallow errors (default if onError is provided)
    // throwOnError: undefined, // Uses default behavior based on onError presence
  }
)
```

- **Default behavior**: `throwOnError` is `true` if no `onError` handler is provided, `false` if an `onError` handler is provided
- **With `onError` handler**: The handler is called first, then the error is thrown if `throwOnError` is `true`
- **Error state**: Failed items are tracked in `failedItems` array and can be accessed via `peekFailedItems()`. The `onError` callback receives the batch of items that failed, not the accumulated failed items.

## Dynamic Options

Like the synchronous batcher, the async batcher supports dynamic options:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    return await processBatch(items)
  },
  {
    // Dynamic batch size based on success rate
    maxSize: (batcher) => {
      const successRate = batcher.store.state.successCount / Math.max(1, batcher.store.state.settleCount)
      return successRate > 0.8 ? 10 : 5 // Larger batches if success rate is high
    },
    // Dynamic wait time based on error count
    wait: (batcher) => {
      return batcher.store.state.errorCount > 5 ? 5000 : 2000 // Wait longer if errors are frequent
    }
  }
)
```

### Flushing Pending Batches

The async batcher supports flushing pending batches to trigger processing immediately:

```ts
const batcher = new AsyncBatcher(asyncBatchFn, { maxSize: 10, wait: 5000 })

batcher.addItem('item1')
batcher.addItem('item2')
console.log(batcher.store.state.isPending) // true

// Flush immediately instead of waiting
const result = await batcher.flush()
console.log('Flush result:', result)
console.log(batcher.store.state.isEmpty) // true (batch was processed)
```

## State Management

The `AsyncBatcher` class uses TanStack Store for reactive state management, providing real-time access to batch execution state, error tracking, and processing statistics. All state is stored in a TanStack Store and can be accessed via `asyncBatcher.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncBatcher.state` along with providing a selector callback as the 3rd argument to the `useAsyncBatcher` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `asyncBatcher.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const batcher = useAsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })
console.log(batcher.state) // {}

// Opt-in to re-render when isExecuting changes
const batcher = useAsyncBatcher(
  asyncBatchFn, 
  { maxSize: 5, wait: 1000 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(batcher.state.isExecuting) // Reactive value

// Multiple state properties
const batcher = useAsyncBatcher(
  asyncBatchFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async batcher. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-batcher-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const batcher = new AsyncBatcher(asyncBatchFn, {
  maxSize: 5,
  wait: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const batcher = new AsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes
const unsubscribe = batcher.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `batcher.store.state` into reactive state with a custom selector wherever you want if necessary.

```ts
const batcher = useAsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })

// you could manually use the `useStore` hook to subscribe to state changes in whatever scope you want
const state = useStore(batcher.store, (state) => ({
  successCount: state.successCount,
}))

console.log(state)
```

### Available State Properties

The `AsyncBatcherState` includes:

- `errorCount`: Number of batch executions that have resulted in errors
- `failedItems`: Array of items that failed during batch processing
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isExecuting`: Whether a batch is currently being processed asynchronously
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `lastResult`: The result from the most recent batch execution
- `settleCount`: Number of batch executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending' | 'executing' | 'populated')
- `successCount`: Number of batch executions that have completed successfully
- `totalItemsFailed`: Total number of items that have failed processing across all batches
- `totalItemsProcessed`: Total number of items that have been processed across all batches

### Monitoring Failed Items

The async batcher tracks items that failed during batch processing:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might fail for some items
    if (items.some(item => item < 0)) {
      throw new Error('Negative numbers not allowed')
    }
    return await processBatch(items)
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      console.log('Failed batch:', batch)
      console.log('All failed items:', batcher.peekFailedItems())
    }
  }
)
```

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async batching functionality to integrate with the framework's state management system. Hooks like `useAsyncBatcher` or similar are available for each framework.

---

For core batching concepts and synchronous batching, see the [Batching Guide](../batching.md).