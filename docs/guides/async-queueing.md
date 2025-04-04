---
title: Asynchronous Queueing Guide
id: async-queueing
---

While the [Queuer](./queueing) provides synchronous queueing with timing controls, the `AsyncQueuer` is designed specifically for handling concurrent asynchronous operations. It implements what is traditionally known as a "task pool" or "worker pool" pattern, allowing multiple operations to be processed simultaneously while maintaining control over concurrency and timing. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

## Key Features

### 1. Concurrent Processing (Task Pooling)
The AsyncQueuer can process multiple operations simultaneously through its task pooling mechanism. This capability is crucial for:
- Making efficient use of system resources
- Handling I/O-bound operations that spend most of their time waiting
- Maximizing throughput while maintaining control
- Processing independent operations in parallel

### 2. Promise Integration
AsyncQueuer is designed to work seamlessly with Promises and async/await:
- Each queued operation returns a Promise that resolves with the operation's result
- Operations can be awaited individually or as a group
- The queue itself can be awaited to determine when all operations complete
- Error handling follows standard Promise patterns

### 3. Dynamic Concurrency Control
The concurrency limit can be adjusted at runtime using the `throttle` method. This allows the system to:
- Respond to system load changes
- Implement adaptive rate limiting
- Handle varying resource availability
- Implement sophisticated backpressure mechanisms

## Basic Usage

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

## Error Handling

AsyncQueuer's error handling system is comprehensive and flexible, providing multiple ways to handle failures:

### 1. Per-Operation Error Handling
Each operation can handle its own errors through the Promise chain:
```ts
asyncQueuer
  .addItem(async () => await riskyOperation())
  .catch(error => handleError(error))
```

### 2. Queue-Level Error Handlers
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

### 3. Error Recovery Strategies
The error handling system enables sophisticated recovery strategies:
- Automatic retries with exponential backoff
- Fallback to alternative operations
- Dead-letter queues for failed operations
- Circuit breakers for failing dependencies

## Common Use Cases

AsyncQueuer is particularly well-suited for:
- Parallel API requests with rate limiting
- Batch processing of data with concurrency control
- Background task processing with error recovery
- Resource-intensive operations that benefit from parallelization
- Long-running operations that need to be monitored and managed
- Systems requiring graceful degradation under load
