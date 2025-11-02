---
title: Async Retrying Guide
id: async-retrying
---

TanStack Pacer provides a simple `asyncRetry` utility function that wraps any async function with retry logic. This is the recommended approach for most use cases, as it creates a new retry-enabled function that can be called multiple times safely. For advanced scenarios requiring state management and reactive updates, TanStack Pacer also provides the `AsyncRetryer` class, though this requires careful usage patterns.

> [!NOTE] The AsyncRetryer API is in alpha and may change before the 1.0.0 release.

Adding retry wrappers to your async functions is a great way to add a layer of robustness to your code. However, there are some important considerations to keep in mind. TanStack Pacer includes safe default options such as exponential backoff and low amount of max attempts by default to prevent overwhelming a service.

> [!NOTE] If you are already using TanStack Query, you should use the built-in retry support instead of using the AsyncRetryer from TanStack Pacer.

## Danger with Misconfigured Retries

Before implementing retries, understanding the underlying concepts helps you make better decisions about retry strategies and configurations.

### The Thundering Herd Problem

The thundering herd problem occurs when many clients simultaneously retry failed requests to a recovering service, overwhelming it and preventing recovery. This usually happens when a service has a brief outage affecting many clients at once, causing all clients to fail and begin retrying. Without any randomization, these clients attempt retries at exactly the same intervals. The resulting synchronized retry attempts put heavy load on the recovering service, which reinforces the outage and leads to more simultaneous retry cycles.

**How TanStack Pacer Addresses This:**

Jitter adds randomness to retry delays, spreading out retry attempts across time rather than having them occur simultaneously. When you configure jitter, each client's retry timing becomes slightly different:

```ts
// Without jitter: all clients retry at exactly 1s, 2s, 4s, 8s
// This can overwhelm a recovering service

// With jitter: clients retry at randomized intervals
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.3 // 30% random variation
})
// Client A might retry at: 850ms, 1.7s, 3.6s, 7.2s
// Client B might retry at: 1.15s, 2.3s, 4.4s, 8.8s
// Client C might retry at: 950ms, 1.9s, 3.8s, 7.6s
```

This distribution prevents synchronized retry waves and gives the service breathing room to recover.

### Exponential Backoff and Resource Conservation

Exponential backoff doubles the wait time between retries. This pattern serves multiple purposes:

**Fast Recovery for Transient Issues:**
The first retry happens quickly (after `baseWait`), catching brief network hiccups or momentary service interruptions.

**Reduced Load on Failing Services:**
As retries continue, the increasing delays reduce the request rate to a struggling service, giving it time to recover rather than keeping it under constant pressure.

**Resource Efficiency:**
Long delays between later retries prevent your application from consuming resources (memory, connections, threads) waiting for a service that might be down for an extended period.

```ts
// With exponential backoff and 1s base wait:
// Attempt 1: immediate
// Attempt 2: 1s later (service might recover quickly)
// Attempt 3: 2s later (giving service more time)
// Attempt 4: 4s later (backing off further)
// Attempt 5: 8s later (minimal load if service is down)
```

## Async Retrying in TanStack Pacer

TanStack Pacer provides two ways to add retry functionality to async functions: the `asyncRetry` convenience function and the `AsyncRetryer` class.

### Using `asyncRetry` Function

The `asyncRetry` function is a convenience wrapper that creates an `AsyncRetryer` instance and returns its execute method:

```ts
import { asyncRetry } from '@tanstack/pacer'

// Define your async function normally
async function fetchData(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}

// Create a retry-enabled version
const fetchWithRetry = asyncRetry(fetchData, {
  maxAttempts: 3,
  backoff: 'exponential',
  baseWait: 1000
})

// Call it
try {
  const data = await fetchWithRetry('/api/data')
  console.log('Success:', data)
} catch (error) {
  console.error('All retries failed:', error)
}
```

### Using `AsyncRetryer` Class

> **⚠️ Important:** The `AsyncRetryer` class is designed for single-use execution. If you call `execute()` multiple times on the same instance, previous executions will be aborted. For multiple calls, create a new instance each time.

The `AsyncRetryer` class provides complete control over retry behavior, state management, and manual abort control:

```ts
import { AsyncRetryer } from '@tanstack/pacer'

const retryer = new AsyncRetryer(
  async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Request failed')
    return response.json()
  },
  {
    maxAttempts: 5,
    backoff: 'exponential',
    baseWait: 1000,
    jitter: 0.1, // Add 10% random variation
    maxExecutionTime: 5000, // Abort individual calls after 5 seconds
    maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
    key: 'api-fetcher', // Identify this retryer in devtools
    onRetry: (attempt, error, retryer) => {
      console.log(`Retry attempt ${attempt} after error:`, error)
    },
    onSuccess: (result, args, retryer) => {
      console.log('Request succeeded:', result)
    },
    onError: (error, args, retryer) => {
      console.error('Request failed:', error)
    },
    onLastError: (error, retryer) => {
      console.error('All retries exhausted:', error)
    },
    onExecutionTimeout: (retryer) => {
      console.log('Execution attempt timed out')
    },
    onTotalExecutionTimeout: (retryer) => {
      console.log('Total execution time exceeded')
    },
    onAbort: (reason, retryer) => {
      console.log('Execution aborted:', reason)
    }
  }
)

// Execute the function with retry logic
const data = await retryer.execute('/api/data')

// Manual abort control - cancel ongoing execution
retryer.abort()

// ❌ DON'T DO THIS - will abort the previous execution
// const data2 = await retryer.execute('/api/other-data')

// ✅ DO THIS INSTEAD - create a new instance for each call
const retryer2 = new AsyncRetryer(asyncFn, options)
const data2 = await retryer2.execute('/api/other-data')
```


## Backoff Strategies

The `backoff` option controls how the wait time between retry attempts changes:

### Exponential Backoff (Default)

Wait time doubles with each attempt. This is the most common strategy and works well for most scenarios:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second (1000ms * 2^0)
// Attempt 3: wait 2 seconds (1000ms * 2^1)
// Attempt 4: wait 4 seconds (1000ms * 2^2)
// Attempt 5: wait 8 seconds (1000ms * 2^3)
```

### Linear Backoff

Wait time increases linearly with each attempt:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'linear',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second (1000ms * 1)
// Attempt 3: wait 2 seconds (1000ms * 2)
// Attempt 4: wait 3 seconds (1000ms * 3)
// Attempt 5: wait 4 seconds (1000ms * 4)
```

### Fixed Backoff

Wait time remains constant for all attempts:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'fixed',
  baseWait: 1000
})
// Attempt 1: immediate
// Attempt 2: wait 1 second
// Attempt 3: wait 1 second
// Attempt 4: wait 1 second
// Attempt 5: wait 1 second
```

## Jitter

Jitter adds randomness to retry delays to prevent thundering herd problems, where many clients retry at the same time and overwhelm a recovering service. The `jitter` option accepts a value between 0 and 1, representing the percentage of random variation to apply:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.1 // Add ±10% random variation
})
// Attempt 2: wait 900-1100ms (1000ms ± 10%)
// Attempt 3: wait 1800-2200ms (2000ms ± 10%)
// Attempt 4: wait 3600-4400ms (4000ms ± 10%)
```

Jitter is particularly useful when:
- Multiple clients might fail at the same time (e.g., service outage)
- You're dealing with rate-limited APIs
- You want to spread out retry attempts to avoid overwhelming a recovering service

## Timeout Controls

TanStack Pacer provides two types of timeout controls to prevent hanging operations:

### Individual Execution Timeout

The `maxExecutionTime` option sets the maximum time for a single function call:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxExecutionTime: 5000, // Abort individual calls after 5 seconds
  onExecutionTimeout: (retryer) => {
    console.log('Execution attempt timed out, retrying...')
  }
})
```

If a single execution exceeds this time, `onExecutionTimeout` is called, followed by `onAbort('execution-timeout')`, and the attempt will be aborted and retried (if attempts remain).

### Total Execution Timeout

The `maxTotalExecutionTime` option sets the maximum time for the entire retry operation:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 5,
  baseWait: 1000,
  maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
  onTotalExecutionTimeout: (retryer) => {
    console.log('Total execution time exceeded, aborting...')
  }
})
```

If the total time across all attempts exceeds this limit, `onTotalExecutionTimeout` is called, followed by `onAbort('total-timeout')`, and the retry operation will be aborted.

### Combining Timeouts

You can combine both timeout types for comprehensive control:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 5,
  backoff: 'exponential',
  baseWait: 1000,
  maxExecutionTime: 5000, // Individual call timeout
  maxTotalExecutionTime: 30000 // Overall operation timeout
})
```

## Error Handling

The async retryer provides comprehensive error handling through callbacks and the `throwOnError` option:

### Error Throwing Behavior

The `throwOnError` option controls when errors are thrown:

```ts
// Default: throw only the last error after all retries fail
const retryer1 = new AsyncRetryer(asyncFn, {
  throwOnError: 'last' // Default
})

// Throw every error immediately (disables retrying)
const retryer2 = new AsyncRetryer(asyncFn, {
  throwOnError: true
})

// Never throw errors, return undefined instead
const retryer3 = new AsyncRetryer(asyncFn, {
  throwOnError: false
})
```

### Error Callbacks

The async retryer supports multiple callbacks for different stages of execution:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 3,
  onRetry: (attempt, error, retryer) => {
    // Called before each retry attempt
    console.log(`Retrying (attempt ${attempt})...`)
    console.log('Error:', error.message)
    console.log('Current attempt:', retryer.store.state.currentAttempt)
  },
  onError: (error, args, retryer) => {
    // Called for every error (including during retries)
    console.error('Execution failed:', error)
    console.log('Failed with arguments:', args)
  },
  onLastError: (error, retryer) => {
    // Called only for the final error after all retries fail
    console.error('All retries exhausted:', error)
    console.log('Total execution time:', retryer.store.state.totalExecutionTime)
  },
  onSuccess: (result, args, retryer) => {
    // Called when execution succeeds
    console.log('Execution succeeded:', result)
    console.log('Succeeded with arguments:', args)
    console.log('Attempts used:', retryer.store.state.currentAttempt)
  },
  onSettled: (args, retryer) => {
    // Called after execution completes (success or failure)
    console.log('Execution settled')
    console.log('Total executions:', retryer.store.state.executionCount)
  },
  onAbort: (reason, retryer) => {
    // Called when execution is aborted (manually or due to timeouts)
    // reason can be: 'manual', 'execution-timeout', 'total-timeout', or 'new-execution'
    console.log('Execution aborted:', reason)
    if (reason === 'execution-timeout') {
      console.log('Single execution timed out')
    } else if (reason === 'total-timeout') {
      console.log('Total execution time exceeded')
    }
  },
  onExecutionTimeout: (retryer) => {
    // Called when a single execution attempt times out (maxExecutionTime exceeded)
    console.log('Execution attempt timed out')
    console.log('Current attempt:', retryer.store.state.currentAttempt)
  },
  onTotalExecutionTimeout: (retryer) => {
    // Called when the total execution time times out (maxTotalExecutionTime exceeded)
    console.log('Total execution time exceeded')
    console.log('Total time:', retryer.store.state.totalExecutionTime)
  }
})
```

### Callback Execution Order

The callbacks are executed in the following order:

```text
1. execute() called
2. Try attempt 1
   └─ If execution times out (maxExecutionTime):
      ├─ onExecutionTimeout() called
      ├─ onAbort('execution-timeout') called
      └─ Retry if attempts remain
   └─ If fails:
      ├─ onError(error) called
      ├─ onRetry(1, error) called
      └─ Wait for backoff
   └─ If succeeds:
      ├─ onSuccess(result) called
      ├─ onSettled() called
      └─ Return result
3. Try attempt 2
   └─ If total time exceeds (maxTotalExecutionTime):
      ├─ onTotalExecutionTimeout() called
      ├─ onAbort('total-timeout') called
      └─ Execution aborted
   └─ If execution times out:
      ├─ onExecutionTimeout() called
      ├─ onAbort('execution-timeout') called
      └─ Retry if attempts remain
   └─ If fails:
      ├─ onError(error) called
      ├─ onRetry(2, error) called
      └─ Wait for backoff
4. Try attempt 3 (last attempt)
   └─ If fails:
      ├─ onLastError(error) called
      ├─ onError(error) called
      ├─ onSettled() called
      └─ Throw error (if throwOnError is 'last' or true)
   └─ If succeeds:
      ├─ onSuccess(result) called
      ├─ onSettled() called
      └─ Return result
5. Manual abort or new execution:
   └─ onAbort('manual') or onAbort('new-execution') called
```

## Dynamic Options and Enabling/Disabling

The async retryer supports dynamic options that can change based on the retryer's current state:

### Dynamic Max Attempts

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: (retryer) => {
    // Retry more times for critical operations
    const errorCount = retryer.store.state.executionCount
    return errorCount > 5 ? 2 : 5
  }
})
```

### Dynamic Base Wait

```ts
const retryer = new AsyncRetryer(asyncFn, {
  baseWait: (retryer) => {
    // Increase wait time if we've had many errors
    const errorCount = retryer.store.state.executionCount
    return errorCount > 10 ? 2000 : 1000
  }
})
```

### Enabling/Disabling

```ts
const retryer = new AsyncRetryer(asyncFn, {
  enabled: (retryer) => {
    // Disable retrying after too many failures
    return retryer.store.state.executionCount < 100
  }
})
```

## Abort and Cancellation

The async retryer supports manual cancellation of ongoing execution and pending retries:

### Manual Abort

```ts
const retryer = new AsyncRetryer(longRunningAsyncFn, {
  maxAttempts: 5,
  baseWait: 1000,
  onAbort: (reason, retryer) => {
    console.log('Execution aborted:', reason)
    // reason will be 'manual' when abort() is called
  }
})

// Start execution
const promise = retryer.execute()

// Cancel execution and pending retries
retryer.abort()

// The promise will resolve to undefined
// onAbort('manual') is called
const result = await promise
console.log(result) // undefined
```

### Making Functions Actually Cancellable with `getAbortSignal()`

For `abort()` to actually cancel your async function (like fetch requests), you need to use the abort signal in your function:

```ts
const retryer = new AsyncRetryer(
  async (url: string) => {
    const signal = retryer.getAbortSignal()
    if (signal) {
      // This fetch will be cancelled when abort() is called
      return await fetch(url, { signal })
    }
    // Fallback for when not executing
    return await fetch(url)
  },
  { maxAttempts: 3 }
)

// Start execution
const promise = retryer.execute('/api/data')

// This will now actually cancel the fetch request
retryer.abort()
```

**Important:** Without using `getAbortSignal()`, calling `abort()` will only cancel the retry logic but not the underlying async operation (like a fetch request). The signal ensures your function can be truly cancelled.

### Reset

The `reset()` method cancels execution and resets all state to initial values:

```ts
const retryer = new AsyncRetryer(asyncFn, { maxAttempts: 3 })

await retryer.execute()
console.log(retryer.store.state.executionCount) // 1

// Reset to initial state
retryer.reset()
console.log(retryer.store.state.executionCount) // 0
console.log(retryer.store.state.lastError) // undefined
console.log(retryer.store.state.lastResult) // undefined
```

## State Management

The `AsyncRetryer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and retry statistics. All state is stored in a TanStack Store and can be accessed via `asyncRetryer.store.state`. Framework adapters provide their own state management patterns for reactive updates.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `retryer.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```tsx
// Example with framework adapter (conceptual)
// Framework adapters provide their own hooks and state management patterns
// Check the specific framework adapter documentation for exact usage
```

### Initial State

You can provide initial state values when creating an async retryer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-retryer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 3,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const retryer = new AsyncRetryer(asyncFn, { maxAttempts: 3 })

// Subscribe to state changes
const unsubscribe = retryer.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
  localStorage.setItem('async-retryer-state', JSON.stringify(state))
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying framework hooks already handle this. You can also import and use `useStore` from TanStack Store to turn `retryer.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `AsyncRetryerState` includes:

- `currentAttempt`: The current retry attempt number (0 when not executing)
- `executionCount`: Total number of completed executions (successful or failed)
- `isExecuting`: Whether the retryer is currently executing the function
- `lastError`: The most recent error encountered during execution
- `lastExecutionTime`: Timestamp of the last execution completion in milliseconds
- `lastResult`: The result from the most recent successful execution
- `status`: Current execution status ('disabled' | 'idle' | 'executing' | 'retrying')
- `totalExecutionTime`: Total time spent executing (including retries) in milliseconds

### Status Values

The `status` property indicates the current state of the retryer:

- `'disabled'`: The retryer is disabled (via `enabled: false`)
- `'idle'`: Ready to execute, not currently running
- `'executing'`: Currently executing the first attempt
- `'retrying'`: Currently executing a retry attempt (attempt > 1)
