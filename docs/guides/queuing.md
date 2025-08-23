---
title: Queuing Guide
id: queuing
---

Unlike [Rate Limiting](../rate-limiting.md), [Throttling](../throttling.md), and [Debouncing](../debouncing.md) which drop executions when they occur too frequently, queuers can be configured to ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable. Queuing can also be set to have a maximum size, which can be useful for preventing memory leaks or other issues. This guide will cover the Queuing concepts of TanStack Pacer.

## Queuing Concept

Queuing ensures that every operation is eventually processed, even if they come in faster than they can be handled. Unlike the other execution control techniques that drop excess operations, queuing buffers operations in an ordered list and processes them according to specific rules. This makes queuing the only "lossless" execution control technique in TanStack Pacer, unless a `maxSize` is specified which can cause items to be rejected when the buffer is full.

### Queuing Visualization

```text
Queuing (processing one item every 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Queue:       [ABC]   [BC]    [BCDE]    [DE]    [E]    []
Executed:     ✅     ✅       ✅        ✅      ✅     ✅
             [=================================================================]
             ^ Unlike rate limiting/throttling/debouncing,
               ALL calls are eventually processed in order

             [Items queue up]   [Process steadily]   [Empty]
              when busy          one by one           queue
```

### When to Use Queuing

Queuing is particularly important when you need to ensure that every operation is processed, even if it means introducing some delay. This makes it ideal for scenarios where data consistency and completeness are more important than immediate execution. When using a `maxSize`, it can also serve as a buffer to prevent overwhelming a system with too many pending operations.

### When Not to Use Queuing

Queuing might not be the best choice when:
- Immediate feedback is more important than processing every operation
- You only care about the most recent value (use [debouncing](../debouncing.md) instead)
- You want to group operations together (use [batching](../batching.md) instead)

> [!TIP]
> If you're currently using rate limiting, throttling, or debouncing but finding that dropped operations are causing problems, queuing is likely the solution you need.

## Queuing in TanStack Pacer

TanStack Pacer provides queuing through the simple `queue` function and the more powerful `Queuer` class. While other execution control techniques typically favor their function-based APIs, queuing often benefits from the additional control provided by the class-based API.

### Basic Usage with `queue`

The `queue` function provides a simple way to create an always-running queue that processes items as they're added:

```ts
import { queue } from '@tanstack/pacer'

// Create a queue that processes items every second
const processItems = queue<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000,
    maxSize: 10, // Optional: limit queue size to prevent memory or time issues
    onItemsChange: (queuer) => {
      console.log('Current queue:', queuer.peekAllItems())
    }
  }
)

// Add items to be processed
processItems(1) // Processed immediately
processItems(2) // Processed after 1 second
processItems(3) // Processed after 2 seconds
```


While the `queue` function is simple to use, it only provides a basic always-running queue through the `addItem` method. For most use cases, you'll want the additional control and features provided by the `Queuer` class.

### Advanced Usage with `Queuer` Class

The `Queuer` class provides complete control over queue behavior and processing:

```ts
import { Queuer } from '@tanstack/pacer'

// Create a queue that processes items every second
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000, // Wait 1 second between processing items
    maxSize: 5, // Optional: limit queue size to prevent memory or time issues
    onItemsChange: (queuer) => {
      console.log('Current queue:', queuer.peekAllItems())
    }
  }
)

// Start processing
queue.start()

// Add items to be processed
queue.addItem(1)
queue.addItem(2)
queue.addItem(3)

// Items will be processed one at a time with 1 second delay between each
// Output:
// Processing: 1 (immediately)
// Processing: 2 (after 1 second)
// Processing: 3 (after 2 seconds)
```

### Queue Types and Ordering

What makes TanStack Pacer's Queuer unique is its ability to adapt to different use cases through its position-based API. The same Queuer can behave as a traditional queue, a stack, or a double-ended queue, all through the same consistent interface.

#### FIFO Queue (First In, First Out)

The default behavior where items are processed in the order they were added. This is the most common queue type and follows the principle that the first item added should be the first one processed. When using `maxSize`, new items will be rejected if the queue is full.

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    addItemsTo: 'back', // default
    getItemsFrom: 'front', // default
  }
)
queue.addItem(1) // [1]
queue.addItem(2) // [1, 2]
// Processes: 1, then 2
```

#### LIFO Stack (Last In, First Out)

By specifying 'back' as the position for both adding and retrieving items, the queuer behaves like a stack. In a stack, the most recently added item is the first one to be processed. When using `maxSize`, new items will be rejected if the stack is full.

```ts
const stack = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    addItemsTo: 'back', // default
    getItemsFrom: 'back', // override default for stack behavior
  }
)
stack.addItem(1) // [1]
stack.addItem(2) // [1, 2]
// Items will process in order: 2, then 1

stack.getNextItem('back') // get next item from back of queue instead of front
```

#### Priority Queue

Priority queues add another dimension to queue ordering by allowing items to be sorted based on their priority rather than just their insertion order. Each item is assigned a priority value, and the queue automatically maintains the items in priority order. When using `maxSize`, lower priority items may be rejected if the queue is full.

```ts
const priorityQueue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    getPriority: (n) => n // Higher numbers have priority
  }
)
priorityQueue.addItem(1) // [1]
priorityQueue.addItem(3) // [3, 1]
priorityQueue.addItem(2) // [3, 2, 1]
// Processes: 3, 2, then 1
```

### Starting and Stopping

The `Queuer` class supports starting and stopping processing through the `start()` and `stop()` methods. By default, queues start processing automatically. You can set `started: false` to have the queue paused initially, allowing you to either:

1. Start processing later with `start()`
2. Manually process items by calling `getNextItem()` in an event-driven manner

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    started: false // Start paused
  }
)

queue.start() // Begin processing items
queue.stop()  // Pause processing

// Manually process items while the queue is stopped (run it your own way)
queue.getNextItem() // Get next item
queue.getNextItem() // Get next item
queue.getNextItem() // Get next item
```

### Additional Features

The Queuer provides several helpful methods for queue management:

```ts
// Queue inspection
queue.peekNextItem()           // View next item without removing it
queue.store.state.size         // Get current queue size
queue.store.state.isEmpty      // Check if queue is empty
queue.store.state.isFull       // Check if queue has reached maxSize
queue.peekAllItems()           // Get copy of all queued items

// Queue manipulation
queue.clear()                  // Remove all items
queue.reset()                  // Reset to initial state
queue.store.state.executionCount // Get number of processed items
queue.flush()                  // Flush all pending items immediately

// Event handling (use the onItemsChange option, not a method)
// Example:
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    onItemsChange: (queuer) => {
      console.log('Processed:', queuer.peekAllItems())
    }
  }
)
```

### Item Expiration

The Queuer supports automatic expiration of items that have been in the queue too long. This is useful for preventing stale data from being processed or for implementing timeouts on queued operations.

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    expirationDuration: 5000, // Items expire after 5 seconds
    onExpire: (item, queuer) => {
      console.log('Item expired:', item)
    }
  }
)

// Or use a custom expiration check
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    getIsExpired: (item, addedAt) => {
      // Custom expiration logic
      return Date.now() - addedAt > 5000
    },
    onExpire: (item, queuer) => {
      console.log('Item expired:', item)
    }
  }
)

// Check expiration statistics
console.log(queue.store.state.expirationCount) // Number of items that have expired
```

Expiration features are particularly useful for:
- Preventing stale data from being processed
- Implementing timeouts on queued operations
- Managing memory usage by automatically removing old items
- Handling temporary data that should only be valid for a limited time

### Rejection Handling

When a queue reaches its maximum size (set by `maxSize` option), new items will be rejected. The Queuer provides ways to handle and monitor these rejections:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    maxSize: 2, // Only allow 2 items in queue
    onReject: (item, queuer) => {
      console.log('Queue is full. Item rejected:', item)
    }
  }
)

queue.addItem(1) // Accepted
queue.addItem(2) // Accepted
queue.addItem(3) // Rejected, triggers onReject callback

console.log(queue.store.state.rejectionCount) // 1
```

### Initial Items

You can pre-populate a queue with initial items when creating it:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    initialItems: [1, 2, 3],
    started: true // Start processing immediately
  }
)

// Queue starts with [1, 2, 3] and begins processing
```

### Dynamic Configuration

The Queuer's options can be modified after creation using `setOptions()`. Additionally, several options support dynamic values through callback functions:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000,
    started: false
  }
)

// Change configuration
queue.setOptions({
  wait: 500, // Process items twice as fast
  started: true // Start processing
})

// Access current state
console.log(queue.store.state.size) // Current queue size
console.log(queue.store.state.isRunning) // Whether queue is running
```

### Dynamic Options

Several options in the Queuer support dynamic values through callback functions that receive the queuer instance:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    // Dynamic wait time based on queue size
    wait: (queuer) => {
      return queuer.store.state.size > 10 ? 2000 : 1000
    }
  }
)
```

The following options support dynamic values:
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated queue behavior that adapts to runtime conditions.

### Flushing Queue Items

The queuer supports flushing items to process them immediately:

```ts
const queue = new Queuer(processFn, { wait: 5000 })

queue.addItem('item1')
queue.addItem('item2')
console.log(queue.store.state.size) // 2

// Flush all items immediately instead of waiting
queue.flush()
console.log(queue.store.state.size) // 0 (items were processed)

// Or flush a specific number of items
queue.addItem('item3')
queue.addItem('item4')
queue.addItem('item5')
queue.flush(2) // Process only 2 items
console.log(queue.store.state.size) // 1 (one item remaining)
```

## State Management

The `Queuer` class uses TanStack Store for reactive state management, providing real-time access to queue state, processing statistics, and concurrent task tracking. All state is stored in a TanStack Store and can be accessed via `queuer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `queuer.state` along with providing a selector callback as the 3rd argument to the `useQueuer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `queuer.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const queue = useQueuer(processFn, { wait: 1000, maxSize: 10 })
console.log(queue.state) // {}

// Opt-in to re-render when size changes
const queue = useQueuer(
  processFn, 
  { wait: 1000, maxSize: 10 },
  (state) => ({ size: state.size })
)
console.log(queue.state.size) // Reactive value

// Multiple state properties
const queue = useQueuer(
  processFn,
  { wait: 1000, maxSize: 10 },
  (state) => ({
    size: state.size,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a queuer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('queuer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const queue = new Queuer(processFn, {
  wait: 1000,
  maxSize: 10,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const queue = new Queuer(processFn, { wait: 1000, maxSize: 10 })

// Subscribe to state changes
const unsubscribe = queue.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `queuer.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `QueuerState` includes:

- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `executionCount`: Number of items that have been processed by the queuer
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `size`: Number of items currently in the queue
- `status`: Current processing status ('idle' | 'running' | 'stopped')

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the queuer classes. Hooks like `useQueuer`, `useQueuedState`, and `useQueuedValue` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous queuing, see the [Async Queuing Guide](../async-queuing.md). 