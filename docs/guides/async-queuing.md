---
title: Asynchronous Queuing Guide
id: async-queuing
---

> **Note:** All core queuing concepts from the [Queuing Guide](../queuing) also apply to AsyncQueuer. AsyncQueuer extends these concepts with advanced features like concurrency (multiple tasks at once) and robust error handling. If you are new to queuing, start with the [Queuing Guide](../queuing) to learn about FIFO/LIFO, priority, expiration, rejection, and queue management. This guide focuses on what makes AsyncQueuer unique and powerful for asynchronous and concurrent task processing.

While the [Queuer](../queuing.md) provides synchronous queuing with timing controls, the `AsyncQueuer` is designed specifically for handling concurrent asynchronous operations. It implements what is traditionally known as a "task pool" or "worker pool" pattern, allowing multiple operations to be processed simultaneously while maintaining control over concurrency and timing. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

## Async Queuing Concept

Async queuing extends the basic queuing concept by adding concurrent processing capabilities. Instead of processing one item at a time, an async queuer can process multiple items simultaneously while still maintaining order and control over the execution. This is particularly useful when dealing with I/O operations, network requests, or any tasks that spend most of their time waiting rather than consuming CPU.

### Async Queuing Visualization

```text
Async Queuing (concurrency: 2, wait: 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️
Queue:       [ABC]   [C]    [CDE]    [E]    []
Active:      [A,B]   [B,C]  [C,D]    [D,E]  [E]
Completed:    -       A      B        C      D,E
             [=================================================================]
             ^ Unlike regular queuing, multiple items
               can be processed concurrently

             [Items queue up]   [Process 2 at once]   [Complete]
              when busy         with wait between      all items
```

### When to Use Async Queuing

Async queuing is particularly effective when you need to:
- Process multiple asynchronous operations concurrently
- Control the number of simultaneous operations
- Handle Promise-based tasks with proper error handling
- Maintain order while maximizing throughput
- Process background tasks that can run in parallel

### When Not to Use Async Queuing

The AsyncQueuer is very versatile and can be used in many situations. If you don't need concurrent processing, use [Queuing](../queuing.md) instead. If you don't need all executions that are queued to go through, use [Throttling](../throttling.md) instead.

If you want to group operations together, use [Batching](../batching.md) instead.

## Async Queuing in TanStack Pacer

TanStack Pacer provides async queuing through the simple `asyncQueue` function and the more powerful `AsyncQueuer` class. All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported just like in the core queuing guide.

### Basic Usage with `asyncQueue`

The `asyncQueue` function provides a simple way to create an always-running async queue:

```ts
import { asyncQueue } from '@tanstack/pacer'

// Create a queue that processes up to 2 items concurrently
const processItems = asyncQueue(
  async (item: number) => {
    // Process each item asynchronously
    const result = await fetchData(item)
    return result
  },
  {
    concurrency: 2,
    onItemsChange: (queuer) => {
      console.log('Active tasks:', queuer.peekActiveItems().length)
    }
  }
)

// Add items to be processed
processItems(1)
processItems(2)
```

For more control over the queue, use the `AsyncQueuer` class directly.

### Advanced Usage with `AsyncQueuer` Class

The `AsyncQueuer` class provides complete control over async queue behavior, including all the core queuing features plus:
- **Concurrency:** Process multiple items at once (configurable with `concurrency`)
- **Async error handling:** Per-task and global error callbacks, with control over error propagation
- **Active and pending task tracking:** Monitor which tasks are running and which are queued
- **Async-specific callbacks:** `onSuccess`, `onError`, `onSettled`, etc.

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    const result = await fetchData(item)
    return result
  },
  {
    concurrency: 2, // Process 2 items at once
    wait: 1000,     // Wait 1 second between starting new items
    started: true   // Start processing immediately
  }
)

// Add error and success handlers via options
queue.setOptions({
  onError: (error, queuer) => {
    console.error('Task failed:', error)
    // You can access queue state here
    console.log('Error count:', queuer.getErrorCount())
  },
  onSuccess: (result, queuer) => {
    console.log('Task completed:', result)
    // You can access queue state here
    console.log('Success count:', queuer.getSuccessCount())
  },
  onSettled: (queuer) => {
    // Called after each execution (success or failure)
    console.log('Total settled:', queuer.getSettledCount())
  }
})

// Add items to be processed
queue.addItem(1)
queue.addItem(2)
```

### Async-Specific Features

All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported—see the [Queuing Guide](../queuing) for details. AsyncQueuer adds:
- **Concurrency:** Multiple items can be processed at once, controlled by the `concurrency` option (can be dynamic).
- **Async error handling:** Use `onError`, `onSuccess`, and `onSettled` for robust error and result tracking.
- **Active and pending task tracking:** Use `peekActiveItems()` and `peekPendingItems()` to monitor queue state.
- **Async expiration and rejection:** Items can expire or be rejected just like in the core queuing guide, but with async-specific callbacks.

### Example: Priority Async Queue

```ts
const priorityQueue = new AsyncQueuer(
  async (item: { value: string; priority: number }) => {
    // Process each item asynchronously
    return await processTask(item.value)
  },
  {
    concurrency: 2,
    getPriority: (item) => item.priority // Higher numbers have priority
  }
)

priorityQueue.addItem({ value: 'low', priority: 1 })
priorityQueue.addItem({ value: 'high', priority: 3 })
priorityQueue.addItem({ value: 'medium', priority: 2 })
// Processes: high and medium concurrently, then low
```

### Example: Error Handling

```ts
const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    if (item < 0) throw new Error('Negative item')
    return await processTask(item)
  },
  {
    onError: (error, queuer) => {
      console.error('Task failed:', error)
      // You can access queue state here
      console.log('Error count:', queuer.getErrorCount())
    },
    throwOnError: true, // Will throw errors even with onError handler
    onSuccess: (result, queuer) => {
      console.log('Task succeeded:', result)
      // You can access queue state here
      console.log('Success count:', queuer.getSuccessCount())
    },
    onSettled: (queuer) => {
      // Called after each execution (success or failure)
      console.log('Total settled:', queuer.getSettledCount())
    }
  }
)

queue.addItem(-1) // Will trigger error handling
queue.addItem(2)
```

### Example: Dynamic Concurrency

```ts
const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    return await processTask(item)
  },
  {
    // Dynamic concurrency based on system load
    concurrency: (queuer) => {
      return Math.max(1, 4 - queuer.peekActiveItems().length)
    },
    // Dynamic wait time based on queue size
    wait: (queuer) => {
      return queuer.getSize() > 10 ? 2000 : 1000
    }
  }
)
```

### Queue Management and Monitoring

AsyncQueuer provides all the queue management and monitoring methods from the core queuing guide, plus async-specific ones:
- `peekActiveItems()` — Items currently being processed
- `peekPendingItems()` — Items waiting to be processed
- `getSuccessCount()`, `getErrorCount()`, `getSettledCount()` — Execution statistics
- `start()`, `stop()`, `clear()`, `reset()`, etc.

See the [Queuing Guide](../queuing) for more on queue management concepts.

### Task Expiration and Rejection

AsyncQueuer supports expiration and rejection just like the core queuer:
- Use `expirationDuration`, `getIsExpired`, and `onExpire` for expiring tasks
- Use `maxSize` and `onReject` for handling queue overflow

See the [Queuing Guide](../queuing.md) for details and examples.

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the async queuer classes. Hooks like `useAsyncQueuer` or `useAsyncQueuedState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.
