---
title: Queueing Guide
id: queueing
---

Unlike [Rate Limiting](../guides/rate-limiting), [Throttling](../guides/throttling), and [Debouncing](../guides/debouncing) which drop executions when they occur too frequently, queuers can be configured to ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable. Queueing can also be set to have a maximum size, which can be useful for preventing memory leaks or other issues. This guide will cover the Queueing concepts of TanStack Pacer.

## Queueing Concept

Queueing ensures that every operation is eventually processed, even if they come in faster than they can be handled. Unlike the other execution control techniques that drop excess operations, queueing buffers operations in an ordered list and processes them according to specific rules. This makes queueing the only "lossless" execution control technique in TanStack Pacer, unless a `maxSize` is specified which can cause items to be rejected when the buffer is full.

### Queueing Visualization

```text
Queueing (processing one item every 2 ticks)
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

### When to Use Queueing

Queueing is particularly important when you need to ensure that every operation is processed, even if it means introducing some delay. This makes it ideal for scenarios where data consistency and completeness are more important than immediate execution. When using a `maxSize`, it can also serve as a buffer to prevent overwhelming a system with too many pending operations.

Common use cases include:
- Pre-fetching data before it's needed without overloading the system
- Processing user interactions in a UI where every action must be recorded
- Handling database operations that need to maintain data consistency
- Managing API requests that must all complete successfully
- Coordinating background tasks that can't be dropped
- Animation sequences where every frame matters
- Form submissions where every entry needs to be saved
- Buffering data streams with a fixed capacity using `maxSize`

### When Not to Use Queueing

Queueing might not be the best choice when:
- Immediate feedback is more important than processing every operation
- You only care about the most recent value (use [debouncing](../guides/debouncing) instead)

> [!TIP]
> If you're currently using rate limiting, throttling, or debouncing but finding that dropped operations are causing problems, queueing is likely the solution you need.

## Queueing in TanStack Pacer

TanStack Pacer provides queueing through the simple `queue` function and the more powerful `Queuer` class. While other execution control techniques typically favor their function-based APIs, queueing often benefits from the additional control provided by the class-based API.

### Basic Usage with `queue`

The `queue` function provides a simple way to create an always-running queue that processes items as they're added:

```ts
import { queue } from '@tanstack/pacer'

// Create a queue that processes items every second
const processItems = queue<number>({
  wait: 1000,
  maxSize: 10, // Optional: limit queue size to prevent memory or time issues
  onItemsChange: (queuer) => {
    console.log('Current queue:', queuer.getAllItems())
  }
})

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
const queue = new Queuer<number>({
  wait: 1000, // Wait 1 second between processing items
  maxSize: 5, // Optional: limit queue size to prevent memory or time issues
  onItemsChange: (queuer) => {
    console.log('Current queue:', queuer.getAllItems())
  }
})

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

```text
FIFO Queue Visualization (with maxSize=3):

Entry →  [A][B][C] → Exit
         ⬇️     ⬆️
      New items   Items are
      added here  processed here
      (rejected if full)

Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️
Queue:       [ABC]   [BC]    [C]    []
Processed:    A       B       C
Rejected:     D      E
```

FIFO queues are ideal for:
- Task processing where order matters
- Message queues where messages need to be processed in sequence
- Print queues where documents should be printed in the order they were sent
- Event handling systems where events must be processed in chronological order

```ts
const queue = new Queuer<number>({
  addItemsTo: 'back', // default
  getItemsFrom: 'front', // default
})
queue.addItem(1) // [1]
queue.addItem(2) // [1, 2]
// Processes: 1, then 2
```

#### LIFO Stack (Last In, First Out)

By specifying 'back' as the position for both adding and retrieving items, the queuer behaves like a stack. In a stack, the most recently added item is the first one to be processed. When using `maxSize`, new items will be rejected if the stack is full.

```text
LIFO Stack Visualization (with maxSize=3):

     ⬆️ Process
    [C] ← Most recently added
    [B]
    [A] ← First added
     ⬇️ Entry
     (rejected if full)

Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️
Queue:       [ABC]   [AB]    [A]    []
Processed:    C       B       A
Rejected:     D      E
```

Stack behavior is particularly useful for:
- Undo/redo systems where the most recent action should be undone first
- Browser history navigation where you want to go back to the most recent page
- Function call stacks in programming language implementations
- Depth-first traversal algorithms

```ts
const stack = new Queuer<number>({
  addItemsTo: 'back', // default
  getItemsFrom: 'back', // override default for stack behavior
})
stack.addItem(1) // [1]
stack.addItem(2) // [1, 2]
// Items will process in order: 2, then 1

stack.getNextItem('back') // get next item from back of queue instead of front
```

#### Priority Queue

Priority queues add another dimension to queue ordering by allowing items to be sorted based on their priority rather than just their insertion order. Each item is assigned a priority value, and the queue automatically maintains the items in priority order. When using `maxSize`, lower priority items may be rejected if the queue is full.

```text
Priority Queue Visualization (with maxSize=3):

Entry →  [P:5][P:3][P:2] → Exit
          ⬇️           ⬆️
     High Priority   Low Priority
     items here      processed last
     (rejected if full)

Timeline: [1 second per tick]
Calls:        ⬇️(P:2)  ⬇️(P:5)  ⬇️(P:1)     ⬇️(P:3)
Queue:       [2]      [5,2]    [5,2,1]    [3,2,1]    [2,1]    [1]    []
Processed:              5         -          3         2        1
Rejected:                         4
```

Priority queues are essential for:
- Task schedulers where some tasks are more urgent than others
- Network packet routing where certain types of traffic need preferential treatment
- Event systems where high-priority events should be handled before lower-priority ones
- Resource allocation where some requests are more important than others

```ts
const priorityQueue = new Queuer<number>({
  getPriority: (n) => n // Higher numbers have priority
})
priorityQueue.addItem(1) // [1]
priorityQueue.addItem(3) // [3, 1]
priorityQueue.addItem(2) // [3, 2, 1]
// Processes: 3, 2, then 1
```

### Starting and Stopping

The `Queuer` class supports starting and stopping processing through the `start()` and `stop()` methods, and can be configured to start automatically with the `started` option:

```ts
const queue = new Queuer<number>({ 
  wait: 1000,
  started: false // Start paused
})

// Control processing
queue.start() // Begin processing items
queue.stop()  // Pause processing

// Check processing state
console.log(queue.getIsRunning()) // Whether the queue is currently processing
console.log(queue.getIsIdle())    // Whether the queue is running but empty
```

If you are using a framework adapter where the queuer options are reactive, you can set the `started` option to a conditional value:

```ts
const queue = useQueuer(
  processItem, 
  { 
    wait: 1000,
    started: isOnline // Start/stop based on connection status IF using a framework adapter that supports reactive options
  }
)
```

### Additional Features

The Queuer provides several helpful methods for queue management:

```ts
// Queue inspection
queue.getPeek()           // View next item without removing it
queue.getSize()          // Get current queue size
queue.getIsEmpty()       // Check if queue is empty
queue.getIsFull()        // Check if queue has reached maxSize
queue.getAllItems()   // Get copy of all queued items

// Queue manipulation
queue.clear()         // Remove all items
queue.reset()         // Reset to initial state
queue.getExecutionCount() // Get number of processed items

// Event handling
queue.onItemsChange((item) => {
  console.log('Processed:', item)
})
```

### Item Expiration

The Queuer supports automatic expiration of items that have been in the queue too long. This is useful for preventing stale data from being processed or for implementing timeouts on queued operations.

```ts
const queue = new Queuer<number>({
  expirationDuration: 5000, // Items expire after 5 seconds
  onExpire: (item, queuer) => {
    console.log('Item expired:', item)
  }
})

// Or use a custom expiration check
const queue = new Queuer<number>({
  getIsExpired: (item, addedAt) => {
    // Custom expiration logic
    return Date.now() - addedAt > 5000
  },
  onExpire: (item, queuer) => {
    console.log('Item expired:', item)
  }
})

// Check expiration statistics
console.log(queue.getExpirationCount()) // Number of items that have expired
```

Expiration features are particularly useful for:
- Preventing stale data from being processed
- Implementing timeouts on queued operations
- Managing memory usage by automatically removing old items
- Handling temporary data that should only be valid for a limited time

### Rejection Handling

When a queue reaches its maximum size (set by `maxSize` option), new items will be rejected. The Queuer provides ways to handle and monitor these rejections:

```ts
const queue = new Queuer<number>({
  maxSize: 2, // Only allow 2 items in queue
  onReject: (item, queuer) => {
    console.log('Queue is full. Item rejected:', item)
  }
})

queue.addItem(1) // Accepted
queue.addItem(2) // Accepted
queue.addItem(3) // Rejected, triggers onReject callback

console.log(queue.getRejectionCount()) // 1
```

### Initial Items

You can pre-populate a queue with initial items when creating it:

```ts
const queue = new Queuer<number>({
  initialItems: [1, 2, 3],
  started: true // Start processing immediately
})

// Queue starts with [1, 2, 3] and begins processing
```

### Dynamic Configuration

The Queuer's options can be modified after creation using `setOptions()` and retrieved using `getOptions()`:

```ts
const queue = new Queuer<number>({
  wait: 1000,
  started: false
})

// Change configuration
queue.setOptions({
  wait: 500, // Process items twice as fast
  started: true // Start processing
})

// Get current configuration
const options = queue.getOptions()
console.log(options.wait) // 500
```

### Performance Monitoring

The Queuer provides methods to monitor its performance:

```ts
const queue = new Queuer<number>()

// Add and process some items
queue.addItem(1)
queue.addItem(2)
queue.addItem(3)

console.log(queue.getExecutionCount()) // Number of items processed
console.log(queue.getRejectionCount()) // Number of items rejected
```

### Asynchronous Queueing

For handling asynchronous operations with multiple workers, see the [Async Queueing Guide](../guides/async-queueing) which covers the `AsyncQueuer` class.

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the queuer classes. Hooks like `useQueuer` or `useQueueState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.