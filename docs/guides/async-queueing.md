---
title: Asynchronous Queueing Guide
id: async-queueing
---

While the [Queuer](../guides//queueing) provides synchronous queueing with timing controls, the `AsyncQueuer` is designed specifically for handling concurrent asynchronous operations. It implements what is traditionally known as a "task pool" or "worker pool" pattern, allowing multiple operations to be processed simultaneously while maintaining control over concurrency and timing. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

## Async Queueing Concept

Async queueing extends the basic queueing concept by adding concurrent processing capabilities. Instead of processing one item at a time, an async queuer can process multiple items simultaneously while still maintaining order and control over the execution. This is particularly useful when dealing with I/O operations, network requests, or any tasks that spend most of their time waiting rather than consuming CPU.

### Async Queueing Visualization

```text
Async Queueing (concurrency: 2, wait: 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️
Queue:       [ABC]   [C]    [CDE]    [E]    []
Active:      [A,B]   [B,C]  [C,D]    [D,E]  [E]
Completed:    -       A      B        C      D,E
             [=================================================================]
             ^ Unlike regular queueing, multiple items
               can be processed concurrently

             [Items queue up]   [Process 2 at once]   [Complete]
              when busy         with wait between      all items
```

### When to Use Async Queueing

Async queueing is particularly effective when you need to:
- Process multiple asynchronous operations concurrently
- Control the number of simultaneous operations
- Handle Promise-based tasks with proper error handling
- Maintain order while maximizing throughput
- Process background tasks that can run in parallel

Common use cases include:
- Making concurrent API requests with rate limiting
- Processing multiple file uploads simultaneously
- Running parallel database operations
- Handling multiple websocket connections
- Processing data streams with backpressure
- Managing resource-intensive background tasks

### When Not to Use Async Queueing

The AsyncQueuer is very versatile and can be used in many situations. Really, it's just not a good fit only when you don't plan to take advantage of all of its features. If you don't need all executions that are queued to go through, use [Throttling](../guides/throttling) instead. If you don't need concurrent processing, use [Queueing](../guides/queueing) instead.

## Async Queueing in TanStack Pacer

TanStack Pacer provides async queueing through the simple `asyncQueue` function and the more powerful `AsyncQueuer` class.

### Basic Usage with `asyncQueue`

The `asyncQueue` function provides a simple way to create an always-running async queue:

```ts
import { asyncQueue } from '@tanstack/pacer'

// Create a queue that processes up to 2 items concurrently
const processItems = asyncQueue({
  concurrency: 2,
  onItemsChange: (queuer) => {
    console.log('Active tasks:', queuer.getActiveItems().length)
  }
})

// Add async tasks to be processed
processItems(async () => {
  const result = await fetchData(1)
  return result
})

processItems(async () => {
  const result = await fetchData(2)
  return result
})
```

The usage of the `asyncQueue` function is a bit limited, as it is just a wrapper around the `AsyncQueuer` class that only exposes the `addItem` method. For more control over the queue, use the `AsyncQueuer` class directly.

### Advanced Usage with `AsyncQueuer` Class

The `AsyncQueuer` class provides complete control over async queue behavior:

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const queue = new AsyncQueuer({
  concurrency: 2, // Process 2 items at once
  wait: 1000,     // Wait 1 second between starting new items
  started: true   // Start processing immediately
})

// Add error and success handlers
queue.onError((error) => {
  console.error('Task failed:', error)
})

queue.onSuccess((result) => {
  console.log('Task completed:', result)
})

// Add async tasks
queue.addItem(async () => {
  const result = await fetchData(1)
  return result
})

queue.addItem(async () => {
  const result = await fetchData(2)
  return result
})
```

### Queue Types and Ordering

The AsyncQueuer supports different queueing strategies to handle various processing requirements. Each strategy determines how tasks are added and processed from the queue.

#### FIFO Queue (First In, First Out)

FIFO queues process tasks in the exact order they were added, making them ideal for maintaining sequence:

```ts
const queue = new AsyncQueuer({
  addItemsTo: 'back',  // default
  getItemsFrom: 'front', // default
  concurrency: 2
})

queue.addItem(async () => 'first')  // [first]
queue.addItem(async () => 'second') // [first, second]
// Processes: first and second concurrently
```

#### LIFO Stack (Last In, First Out)

LIFO stacks process the most recently added tasks first, useful for prioritizing newer tasks:

```ts
const stack = new AsyncQueuer({
  addItemsTo: 'back',
  getItemsFrom: 'back', // Process newest items first
  concurrency: 2
})

stack.addItem(async () => 'first')  // [first]
stack.addItem(async () => 'second') // [first, second]
// Processes: second first, then first
```

#### Priority Queue

Priority queues process tasks based on their assigned priority values, ensuring important tasks are handled first. There are two ways to specify priorities:

1. Static priority values attached to tasks:
```ts
const priorityQueue = new AsyncQueuer({
  concurrency: 2
})

// Create tasks with static priority values
const lowPriorityTask = Object.assign(
  async () => 'low priority result',
  { priority: 1 }
)

const highPriorityTask = Object.assign(
  async () => 'high priority result',
  { priority: 3 }
)

const mediumPriorityTask = Object.assign(
  async () => 'medium priority result',
  { priority: 2 }
)

// Add tasks in any order - they'll be processed by priority (higher numbers first)
priorityQueue.addItem(lowPriorityTask)
priorityQueue.addItem(highPriorityTask)
priorityQueue.addItem(mediumPriorityTask)
// Processes: high and medium concurrently, then low
```

2. Dynamic priority calculation using `getPriority` option:
```ts
const dynamicPriorityQueue = new AsyncQueuer({
  concurrency: 2,
  getPriority: (task) => {
    // Calculate priority based on task properties or other factors
    // Higher numbers have priority
    return calculateTaskPriority(task)
  }
})

// Add tasks - priority will be calculated dynamically
dynamicPriorityQueue.addItem(async () => {
  const result = await processTask('low')
  return result
})

dynamicPriorityQueue.addItem(async () => {
  const result = await processTask('high')
  return result
})
```

Priority queues are essential when:
- Tasks have different importance levels
- Critical operations need to run first
- You need flexible task ordering based on priority
- Resource allocation should favor important tasks
- Priority needs to be determined dynamically based on task properties or external factors

### Error Handling

The AsyncQueuer provides comprehensive error handling capabilities to ensure robust task processing. You can handle errors at both the queue level and individual task level:

```ts
const queue = new AsyncQueuer({
  // Handle errors globally
  onError: (error, queuer) => {
    console.error('Task failed:', error)
    // You can access queue state here
    console.log('Error count:', queuer.getErrorCount())
  },
  // Control error throwing behavior
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
})

// Handle errors per task
queue.addItem(async () => {
  throw new Error('Task failed')
}).catch(error => {
  console.error('Individual task error:', error)
})
```

Key error handling features:
- If a task throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If an `onError` handler is provided, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `getErrorCount()` and check execution state with `getActiveItems()`
- The queue maintains its state and can continue processing other tasks after an error occurs
- Each task can have its own error handling via Promise catch blocks
- The `onSettled` callback is called after each execution attempt, regardless of success or failure

### Callback Options

The AsyncQueuer provides several callback options for monitoring task execution and queue state:

```ts
const queue = new AsyncQueuer({
  // Handle successful task completion
  onSuccess: (result, queuer) => {
    console.log('Task succeeded:', result)
    // Access queue state
    console.log('Success count:', queuer.getSuccessCount())
  },
  // Handle task errors
  onError: (error, queuer) => {
    console.error('Task failed:', error)
    // Access queue state
    console.log('Error count:', queuer.getErrorCount())
  },
  // Handle task completion regardless of success/failure
  onSettled: (queuer) => {
    // Called after each execution (success or failure)
    console.log('Total settled:', queuer.getSettledCount())
  },
  // Handle queue state changes
  onItemsChange: (queuer) => {
    console.log('Queue size:', queuer.getSize())
    console.log('Active items:', queuer.getActiveItems().length)
  },
  // Handle running state changes
  onIsRunningChange: (queuer) => {
    console.log('Queue running:', queuer.getIsRunning())
  }
})
```

### Queue Management

The AsyncQueuer provides several methods for monitoring and controlling queue state:

```ts
// Queue inspection
queue.getPeek()           // View next item without removing it
queue.getSize()          // Get current queue size
queue.getIsEmpty()       // Check if queue is empty
queue.getIsFull()        // Check if queue has reached maxSize
queue.getAllItems()      // Get copy of all queued items
queue.getActiveItems()   // Get currently processing items
queue.getPendingItems()  // Get items waiting to be processed

// Queue manipulation
queue.clear()            // Remove all items
queue.reset()            // Reset to initial state
queue.getExecutionCount() // Get number of processed items

// Processing control
queue.start()            // Begin processing items
queue.stop()             // Pause processing
queue.getIsRunning()     // Check if queue is processing
queue.getIsIdle()        // Check if queue is empty and not processing

// Statistics
queue.getSuccessCount()  // Get number of successful executions
queue.getErrorCount()    // Get number of failed executions
queue.getSettledCount()  // Get total number of completed executions
queue.getRejectionCount() // Get number of rejected items
queue.getExpirationCount() // Get number of expired items
```

### Rejection Handling

When a queue reaches its maximum size (set by `maxSize` option), new tasks will be rejected. The AsyncQueuer provides ways to handle and monitor these rejections:

```ts
const queue = new AsyncQueuer({
  maxSize: 2, // Only allow 2 tasks in queue
  onReject: (task, queuer) => {
    console.log('Queue is full. Task rejected:', task)
    // Access queue state
    console.log('Rejection count:', queuer.getRejectionCount())
  }
})

queue.addItem(async () => 'first') // Accepted
queue.addItem(async () => 'second') // Accepted
queue.addItem(async () => 'third') // Rejected, triggers onReject callback

console.log(queue.getRejectionCount()) // 1
```

### Task Expiration

The AsyncQueuer supports task expiration to automatically remove stale tasks from the queue:

```ts
const queue = new AsyncQueuer({
  expirationDuration: 5000, // Tasks expire after 5 seconds
  onExpire: (task, queuer) => {
    console.log('Task expired:', task)
    // Access queue state
    console.log('Expiration count:', queuer.getExpirationCount())
  }
})

// Or use custom expiration logic
const queue = new AsyncQueuer({
  getIsExpired: (task, addedAt) => {
    // Custom expiration logic
    return Date.now() - addedAt > 5000
  }
})
```

### Initial Tasks

You can pre-populate an async queue with initial tasks when creating it:

```ts
const queue = new AsyncQueuer({
  initialItems: [
    async () => 'first',
    async () => 'second',
    async () => 'third'
  ],
  started: true // Start processing immediately
})

// Queue starts with three tasks and begins processing them
```

### Dynamic Configuration

The AsyncQueuer's options can be modified after creation using `setOptions()` and retrieved using `getOptions()`. Additionally, several options support dynamic values through callback functions:

```ts
const queue = new AsyncQueuer({
  concurrency: 2,
  wait: 1000,
  started: false
})

// Change configuration
queue.setOptions({
  concurrency: 4, // Process more tasks simultaneously
  started: true // Start processing
})

// Get current configuration
const options = queue.getOptions()
console.log(options.concurrency) // 4
```

### Dynamic Options

Several options in the AsyncQueuer support dynamic values through callback functions that receive the queuer instance:

```ts
const queue = new AsyncQueuer({
  // Dynamic concurrency based on system load
  concurrency: (queuer) => {
    return Math.max(1, 4 - queuer.getActiveItems().length)
  },
  // Dynamic wait time based on queue size
  wait: (queuer) => {
    return queuer.getSize() > 10 ? 2000 : 1000
  }
})
```

The following options support dynamic values:
- `concurrency`: Can be a number or a function that returns a number
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated queue behavior that adapts to runtime conditions.

### Active and Pending Tasks

The AsyncQueuer provides methods to monitor both active and pending tasks:

```ts
const queue = new AsyncQueuer({
  concurrency: 2
})

// Add some tasks
queue.addItem(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return 'first'
})
queue.addItem(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return 'second'
})
queue.addItem(async () => 'third')

// Monitor task states
console.log(queue.getActiveItems().length) // Currently processing tasks
console.log(queue.getPendingItems().length) // Tasks waiting to be processed
```

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the async queuer classes. Hooks like `useAsyncQueuer` or `useAsyncQueuedState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.
