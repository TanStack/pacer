---
title: Scheduling Concepts
id: scheduling-concepts
---

While the [Queue](./queueing-concepts.md) provides the foundational data structure for storing items, Queuers add automatic processing capabilities. TanStack Pacer provides two types of Queuers: the synchronous `Queuer` for basic scheduling needs and the more sophisticated `AsyncQueuer` for handling concurrent asynchronous operations.

## Queuer (Synchronous Scheduler)

The `Queuer` class extends the base `Queue` to add automatic processing capabilities, effectively turning it into a scheduler. This is a significant step up in functionality, as it removes the need to manually trigger processing of queue items.

### Controlled Timing

The Queuer introduces the concept of controlled timing through its `wait` option, allowing you to throttle how quickly items are processed. This feature is particularly useful for rate limiting operations without dropping them, creating smooth animations or transitions, implementing progressive loading of data, and controlling resource usage by spacing out operations.

The Queuer maintains all the ordering capabilities of the base Queue (FIFO, LIFO, Priority) while adding automatic processing with start/stop control, configurable delays between operations, event callbacks for monitoring processing, and comprehensive state management for running, stopped, and idle states.

```ts
import { Queuer } from '@tanstack/pacer'

const queuer = new Queuer<number>({
  wait: 1000, // Wait 1 second between processing items
})

// Add callback for when items are processed
queuer.onUpdate(num => console.log(`Processing: ${num}`))

// Start processing
queuer.start()

// Add items to be processed
queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)

// Items will be processed one at a time with 1 second delay between each
// Output:
// Processing: 1 (immediately)
// Processing: 2 (after 1 second)
// Processing: 3 (after 2 seconds)
```

### Use Cases

The Queuer is particularly useful in scenarios where operations must be processed in a specific order, you need to control the rate of processing without dropping operations, operations are synchronous and need to be spaced out, or you want to avoid overwhelming the system with too many operations at once.

Common applications include:
- UI updates that need to be sequenced
- Animation sequences that must maintain timing
- Rate-limited API calls that must complete in order
- Resource-intensive calculations that need spacing

## AsyncQueuer (Concurrent Async Scheduler)

The `AsyncQueuer` represents the most sophisticated queueing implementation in TanStack Pacer, implementing what is traditionally known as a "task pool" or "worker pool" pattern. It builds upon the Queuer's capabilities but adds crucial features for handling asynchronous operations. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

### Key Features

1. **Concurrent Processing (Task Pooling)**
The AsyncQueuer can process multiple operations simultaneously through its task pooling mechanism, unlike its synchronous counterpart. This capability is crucial for making efficient use of system resources, handling I/O-bound operations that spend most of their time waiting, maximizing throughput while maintaining control, and processing independent operations in parallel.

2. **Promise Integration**
AsyncQueuer is designed to work seamlessly with Promises and async/await. Each queued operation returns a Promise that resolves with the operation's result, allowing operations to be awaited individually or as a group. The queue itself can be awaited to determine when all operations complete, and error handling follows standard Promise patterns.

3. **Dynamic Concurrency Control**
The concurrency limit can be adjusted at runtime using the `throttle` method. This allows the system to respond to system load changes, implement adaptive rate limiting, handle varying resource availability, and implement sophisticated backpressure mechanisms.

### Basic Usage

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const asyncQueuer = new AsyncQueuer<string>({
  concurrency: 2, // Process 2 items at once
  wait: 1000,     // Wait 1 second between starting new items
})

// Add error and success handlers
asyncQueuer.onError((error, task) => {
  console.error('Task failed:', error)
})

asyncQueuer.onSuccess((result, task) => {
  console.log('Task completed:', result)
})

// Start processing
asyncQueuer.start()

// Add async tasks
asyncQueuer.addItem(async () => {
  const result = await fetchData(1)
  return result
})

asyncQueuer.addItem(async () => {
  const result = await fetchData(2)
  return result
})
```

### Error Handling

AsyncQueuer's error handling system is comprehensive and flexible, providing multiple ways to handle failures:

1. **Per-Operation Error Handling**
Each operation can handle its own errors through the Promise chain:
```ts
asyncQueuer
  .addItem(async () => await riskyOperation())
  .catch(error => handleError(error))
```

2. **Queue-Level Error Handlers**
Global handlers can catch errors from any operation:
```ts
const asyncQueuer = new AsyncQueuer<string>()

// Handle task errors
asyncQueuer.onError((error, task) => {
  console.error('Task failed:', error)
  // Optionally retry the task or notify monitoring systems
})

// Handle successful completions
asyncQueuer.onSuccess((result, task) => {
  console.log('Task completed:', result)
  // Update UI or trigger dependent operations
})

// Handle all task completions (success or error)
asyncQueuer.onSettled((result, error) => {
  if (error) {
    console.log('Task failed:', error)
  } else {
    console.log('Task succeeded:', result)
  }
  // Update progress indicators or clean up resources
})
```

3. **Error Recovery Strategies**
The error handling system enables sophisticated recovery strategies including automatic retries with exponential backoff, fallback to alternative operations, dead-letter queues for failed operations, and circuit breakers for failing dependencies.
