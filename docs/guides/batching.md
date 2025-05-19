---
title: Batching Guide
id: batching
---

Batching is a powerful technique for grouping multiple operations together and processing them as a single unit. Unlike [Queuing](./queuing.md), which ensures every operation is processed individually, batching collects items and processes them in configurable groups, improving efficiency and reducing overhead. This guide covers the Batching concepts of TanStack Pacer.

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
- Every item must be processed individually and immediately (use [queuing](./queuing.md))
- You only care about the most recent value (use [debouncing](./debouncing.md))

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
      console.log('Current batch:', batcher.getAllItems())
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
      console.log('Current batch:', batcher.getAllItems())
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
batcher.getSize()               // Get current batch size
batcher.getIsEmpty()            // Check if batch is empty
batcher.getIsRunning()          // Check if batcher is running
batcher.getAllItems()           // Get all items in the current batch
batcher.getBatchExecutionCount()// Number of batches processed
batcher.getItemExecutionCount() // Number of items processed
batcher.setOptions(opts)        // Update batcher options
batcher.getOptions()            // Get current options
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

## Performance Monitoring

Batcher provides methods to monitor its performance:

```ts
console.log(batcher.getBatchExecutionCount()) // Number of batches processed
console.log(batcher.getItemExecutionCount())  // Number of items processed
```

## Framework Adapters

Each framework adapter builds convenient hooks and functions around the batcher classes. Hooks like `useBatcher`, or `createBatcher` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.