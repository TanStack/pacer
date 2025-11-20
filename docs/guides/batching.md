---
title: Batching Guide
id: batching
---

Batching is a powerful technique for grouping multiple operations together and processing them as a single unit. Unlike [Queuing](../queuing.md), which ensures every operation is processed individually, batching collects items and processes them in configurable groups, improving efficiency and reducing overhead. This guide covers the Batching concepts of TanStack Pacer.

## Batching Concept

Batching collects items over time or until a certain size is reached, then processes them all at once. This is ideal for scenarios where processing items in bulk is more efficient than handling them one by one. Batching can be triggered by:
- Reaching a maximum batch size
- Waiting a maximum amount of time
- Custom logic (e.g., a special item or condition)

### Batching Visualization

```text
Batching (processing every 3 items or every 2 seconds)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Batch:       [ABC]   []      [DE]      []      [FGH]  []
Executed:     ✅             ✅         ✅
             [===============================]
             ^ Items are grouped and processed together

             [Items accumulate]   [Process batch]   [Empty]
                in batch           as group         batch
```

## When to Use Batching

Batching is best when:
- Processing items in groups is more efficient (e.g., network requests, database writes)
- You want to reduce the frequency of expensive operations
- You need to control the rate or size of processing
- You want to debounce bursts of activity into fewer operations

## When Not to Use Batching

Batching may not be ideal when:
- Every item must be processed individually and immediately (use [queuing](../queuing.md))
- You only care about the most recent value (use [debouncing](../debouncing.md))

> [!TIP]
> If you find yourself making repeated calls that could be grouped, batching can help you optimize performance and resource usage.

## Batching in TanStack Pacer

TanStack Pacer provides batching through the `Batcher` class and the simple `batch` function. Both allow you to collect items and process them in configurable batches.

### Basic Usage with `batch`

The `batch` function provides a simple way to create a batching function:

```ts
import { batch } from '@tanstack/pacer'

// Create a batcher that processes up to 3 items or every 2 seconds
const processBatch = batch<number>(
  (items) => {
    // Process the batch
    console.log('Processing batch:', items)
  },
  {
    maxSize: 3, // Process when 3 items are collected
    wait: 2000, // Or after 2 seconds, whichever comes first
    onItemsChange: (batcher) => {
      console.log('Current batch:', batcher.peekAllItems())
    }
  }
)

// Add items to be batched
processBatch(1)
processBatch(2)
processBatch(3) // Triggers batch processing
processBatch(4)
// Or wait 2 seconds for the next batch to process
```

> **Note:** When using React, prefer `useBatchedCallback` hook over the `batch` function for better integration with React's lifecycle and automatic cleanup.

The `batch` function returns a function that adds items to the batch. Batches are processed automatically based on your configuration.

### Advanced Usage with `Batcher` Class

The `Batcher` class provides full control over batching behavior:

```ts
import { Batcher } from '@tanstack/pacer'

// Create a batcher that processes up to 5 items or every 3 seconds
const batcher = new Batcher<number>(
  (items) => {
    // Process the batch
    console.log('Processing batch:', items)
  },
  {
    maxSize: 5, // Process when 5 items are collected
    wait: 3000, // Or after 3 seconds
    getShouldExecute: (items, batcher) => items.includes(42), // Custom trigger
    onItemsChange: (batcher) => {
      console.log('Current batch:', batcher.peekAllItems())
    }
  }
)

// Add items to the batch
batcher.addItem(1)
batcher.addItem(2)
batcher.addItem(3)
// ...

// Manually process the current batch
batcher.execute()

// Control batching
batcher.stop()  // Pause batching
batcher.start() // Resume batching
```

## Batcher Options

Batcher options allow you to customize how and when batches are processed:

- `maxSize`: Maximum number of items per batch (default: `Infinity`)
- `wait`: Maximum time (ms) to wait before processing a batch (default: `Infinity`)
- `getShouldExecute`: Custom function to determine if a batch should be processed
- `onExecute`: Callback after a batch is processed
- `onItemsChange`: Callback after items are added or batch is processed
- `onIsRunningChange`: Callback when the batcher's running state changes
- `started`: Whether the batcher starts running immediately (default: `true`)

## Batcher Methods

The `Batcher` class provides several methods for batch management:

```ts
batcher.addItem(item)           // Add an item to the batch
batcher.execute()               // Manually process the current batch
batcher.stop()                  // Pause batching
batcher.start()                 // Resume batching
batcher.store.state.size        // Get current batch size
batcher.store.state.isEmpty     // Check if batch is empty
batcher.store.state.isRunning   // Check if batcher is running
batcher.peekAllItems()           // Get all items in the current batch
batcher.store.state.executionCount // Number of batches processed
batcher.store.state.totalItemsProcessed // Number of items processed
batcher.setOptions(opts)        // Update batcher options
batcher.flush()                 // Flush pending batch immediately
```

## Custom Batch Triggers

You can use `getShouldExecute` to trigger a batch based on custom logic:

```ts
const batcher = new Batcher<number>(
  (items) => console.log('Processing batch:', items),
  {
    getShouldExecute: (items) => items.includes(99),
  }
)

batcher.addItem(1)
batcher.addItem(99) // Triggers batch processing immediately
```

## Dynamic Configuration

You can update batcher options at runtime:

```ts
batcher.setOptions({
  maxSize: 10,
  wait: 1000,
})

const options = batcher.getOptions()
console.log(options.maxSize) // 10
```

## State Management

The `Batcher` class uses TanStack Store for reactive state management, providing real-time access to batch state, execution counts, and processing status. All state is stored in a TanStack Store and can be accessed via `batcher.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `batcher.state` along with providing a selector callback as the 3rd argument to the `useBatcher` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `batcher.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const batcher = useBatcher(processFn, { maxSize: 5, wait: 1000 })
console.log(batcher.state) // {}

// Opt-in to re-render when size changes
const batcher = useBatcher(
  processFn, 
  { maxSize: 5, wait: 1000 },
  (state) => ({ size: state.size })
)
console.log(batcher.state.size) // Reactive value

// Multiple state properties
const batcher = useBatcher(
  processFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({
    size: state.size,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a batcher. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('batcher-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const batcher = new Batcher(processFn, {
  maxSize: 5,
  wait: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const batcher = new Batcher(processFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes
const unsubscribe = batcher.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `batcher.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `BatcherState` includes:

- `executionCount`: Number of batch executions that have been completed
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending')
- `totalItemsProcessed`: Total number of items that have been processed across all batches

### Flushing Pending Batches

The batcher supports flushing pending batches to trigger processing immediately:

```ts
const batcher = new Batcher(processFn, { maxSize: 10, wait: 5000 })

batcher.addItem('item1')
batcher.addItem('item2')
console.log(batcher.store.state.isPending) // true

// Flush immediately instead of waiting
batcher.flush()
console.log(batcher.store.state.isEmpty) // true (batch was processed)
```

## Framework Adapters

Each framework adapter builds convenient hooks and functions around the batcher classes. Hooks like `useBatcher`, or `createBatcher` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

For asynchronous batching, see the [Async Batching Guide](../async-batching.md).