---
title: Asynchronous Queuing Guide
id: async-queuing
---

> **Note:** All core queuing concepts from the [Queuing Guide](./queuing) also apply to AsyncQueuer. AsyncQueuer extends these concepts with advanced features like concurrency (multiple tasks at once) and robust error handling. If you are new to queuing, start with the [Queuing Guide](./queuing) to learn about FIFO/LIFO, priority, expiration, rejection, and queue management. This guide focuses on what makes AsyncQueuer unique and powerful for asynchronous and concurrent task processing.

While the [Queuer](./queuing.md) provides synchronous queuing with timing controls, the `AsyncQueuer` is designed specifically for handling concurrent asynchronous operations. It implements what is traditionally known as a "task pool" or "worker pool" pattern, allowing multiple operations to be processed simultaneously while maintaining control over concurrency and timing. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

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

The AsyncQueuer is very versatile and can be used in many situations. If you don't need concurrent processing, use [Queuing](./queuing.md) instead. If you don't need all executions that are queued to go through, use [Throttling](./throttling.md) instead.

If you want to group operations together, use [Batching](./batching.md) instead.

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
    started: true,  // Start processing immediately
    key: 'data-processor' // Identify this queuer in devtools
  }
)

// Add error and success handlers via options
queue.setOptions({
  onError: (error, item, queuer) => {
    console.error('Task failed:', error)
    console.log('Failed item:', item)
    // You can access queue state here
    console.log('Error count:', queuer.store.state.errorCount)
  },
  onSuccess: (result, item, queuer) => {
    console.log('Task completed:', result)
    console.log('Completed item:', item)
    // You can access queue state here
    console.log('Success count:', queuer.store.state.successCount)
  },
  onSettled: (item, queuer) => {
    // Called after each execution (success or failure)
    console.log('Task settled:', item)
    console.log('Total settled:', queuer.store.state.settledCount)
  }
})

// Add items to be processed
queue.addItem(1)
queue.addItem(2)
```

### Async-Specific Features

All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported—see the [Queuing Guide](./queuing) for details. AsyncQueuer adds:
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
    onError: (error, item, queuer) => {
      console.error('Task failed:', error)
      console.log('Failed item:', item)
      // You can access queue state here
      console.log('Error count:', queuer.store.state.errorCount)
    },
    throwOnError: true, // Will throw errors even with onError handler
    onSuccess: (result, item, queuer) => {
      console.log('Task succeeded:', result)
      console.log('Succeeded item:', item)
      // You can access queue state here
      console.log('Success count:', queuer.store.state.successCount)
    },
    onSettled: (item, queuer) => {
      // Called after each execution (success or failure)
      console.log('Task settled:', item)
      console.log('Total settled:', queuer.store.state.settledCount)
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
      return Math.max(1, 4 - queuer.store.state.activeItems.length)
    },
    // Dynamic wait time based on queue size
    wait: (queuer) => {
      return queuer.store.state.size > 10 ? 2000 : 1000
    }
  }
)
```

### Queue Management and Monitoring

AsyncQueuer provides all the queue management and monitoring methods from the core queuing guide, plus async-specific ones:
- `peekActiveItems()` — Items currently being processed
- `peekPendingItems()` — Items waiting to be processed
- `queuer.store.state.successCount`, `queuer.store.state.errorCount`, `queuer.store.state.settledCount` — Execution statistics
- `queuer.store.state.activeItems` — Array of items currently being processed
- `queuer.store.state.size` — Current queue size
- `start()`, `stop()`, `clear()`, `reset()`, `flush()`, etc.

See the [Queuing Guide](./queuing) for more on queue management concepts.

### Task Expiration and Rejection

AsyncQueuer supports expiration and rejection just like the core queuer:
- Use `expirationDuration`, `getIsExpired`, and `onExpire` for expiring tasks
- Use `maxSize` and `onReject` for handling queue overflow

See the [Queuing Guide](./queuing.md) for details and examples.

### Flushing Queue Items

The async queuer supports flushing items to process them immediately:

```ts
const queue = new AsyncQueuer(processFn, { concurrency: 2, wait: 5000 })

queue.addItem('item1')
queue.addItem('item2')
queue.addItem('item3')
console.log(queue.store.state.size) // 3

// Flush all items immediately instead of waiting
queue.flush()
console.log(queue.store.state.activeItems.length) // 2 (processing concurrently)
console.log(queue.store.state.size) // 1 (one remaining)

// Or flush a specific number of items
queue.flush(1) // Process 1 more item
console.log(queue.store.state.activeItems.length) // 3 (all processing concurrently)
```

### Customizing Unmount Behavior

Framework hooks stop the queuer by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const queuer = useAsyncQueuer(fn, {
  concurrency: 2,
  onUnmount: (q) => q.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your task function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

## Advanced Features: Retry and Abort Support

The async queuer includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight task executions.

### Retry Support

Configure automatic retries for failed task executions using the `asyncRetryerOptions`. Each queued item's execution will be retried according to these settings:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // This might fail due to network issues
    await api.processItem(item)
  },
  {
    concurrency: 2,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retrying.md).

### Abort Support

Cancel in-flight task executions using the abort functionality:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // Access the abort signal for this execution
    const signal = queuer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/process/${item}`, { signal })
      return response.json()
    }
  },
  { concurrency: 2 }
)

// Add items to the queue
queuer.addItem('task1')
queuer.addItem('task2')
queuer.addItem('task3')

// Later, abort any in-flight task executions
queuer.abort()
```

The abort functionality:
- Cancels all ongoing task executions using AbortController
- Does NOT clear items from the queue (pending tasks remain queued)
- Works with concurrent executions - aborts all active tasks
- Can be used alongside retry support

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retrying.md).

### Sharing Options Between Instances

Use `asyncQueuerOptions` to share common options between different `AsyncQueuer` instances:

```ts
import { asyncQueuerOptions, AsyncQueuer } from '@tanstack/pacer'

const sharedOptions = asyncQueuerOptions({
  concurrency: 2,
  wait: 1000,
  onSuccess: (result, item, queuer) => console.log('Success')
})

const queuer1 = new AsyncQueuer(fn1, { ...sharedOptions, key: 'queuer1' })
const queuer2 = new AsyncQueuer(fn2, { ...sharedOptions, concurrency: 4 })
```

## State Management

The `AsyncQueuer` class uses TanStack Store for reactive state management, providing real-time access to queue state, processing statistics, and concurrent task tracking. All state is stored in a TanStack Store and can be accessed via `asyncQueuer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncQueuer.state` along with providing a selector callback as the 3rd argument to the `useAsyncQueuer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncQueuer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncQueuer = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncQueuer.Subscribe selector={(state) => ({ activeItems: state.activeItems })}>
  {(state) => (
    <div>Active items: {state.activeItems.length}</div>
  )}
</asyncQueuer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncQueuer.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const queue = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })
console.log(queue.state) // {}

// Opt-in to re-render when activeItems changes
const queue = useAsyncQueuer(
  processFn, 
  { concurrency: 2, wait: 1000 },
  (state) => ({ activeItems: state.activeItems })
)
console.log(queue.state.activeItems.length) // Reactive value

// Multiple state properties
const queue = useAsyncQueuer(
  processFn,
  { concurrency: 2, wait: 1000 },
  (state) => ({
    activeItems: state.activeItems,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async queuer:

```ts
const savedState = localStorage.getItem('async-queuer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const queue = new AsyncQueuer(processFn, {
  concurrency: 2,
  wait: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const queue = new AsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes
const unsubscribe = queue.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `queuer.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `AsyncQueuerState` includes all properties from the core queuing guide plus:

- `activeItems`: Array of items currently being processed
- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `errorCount`: Number of function executions that have resulted in errors
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `lastResult`: The result from the most recent successful function execution
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `settledCount`: Number of function executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the queue
- `status`: Current processing status ('idle' | 'running' | 'stopped')
- `successCount`: Number of function executions that have completed successfully

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the async queuer classes. Hooks like `useAsyncQueuer` or `useAsyncQueuedState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For core queuing concepts and synchronous queuing, see the [Queuing Guide](./queuing.md).