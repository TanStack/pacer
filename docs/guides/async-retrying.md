---
title: Async Retrying Guide
id: async-retrying
---

TanStack Pacer provides its own retrying utility as a standalone `AsyncRetryer` class or a wrapper function `asyncRetry` for convenience. All of the other async utilities from TanStack Pacer use the `AsyncRetryer` class internally to wrap their executions with built-in retrying functionality. The Async Retryer supports features such as different backoff strategies, jitter, max timeouts, aborting, error handling, and more.

## When to Use Retries

Async retrying is particularly effective when you need to:
- Handle transient failures in API calls or network requests
- Implement robust error recovery for flaky operations
- Deal with rate-limited APIs that may temporarily reject requests
- Retry database operations that may fail due to temporary connection issues
- Handle operations that depend on external services with variable reliability

### When Not to Use Retries

Avoid async retrying when:
- The operation is not idempotent (retrying could cause unwanted side effects)
- Errors are permanent and retrying won't help (e.g., authentication failures, invalid input)
- The operation is time-sensitive and delays are unacceptable
- You need immediate feedback on failures without any retry attempts

For operations that need to be queued and processed sequentially, use [Queuing](../queuing.md) instead. For operations that should be delayed until inactivity, use [Debouncing](../debouncing.md) instead.

## Understanding Retry Behavior

Before implementing retries, understanding the underlying concepts helps you make better decisions about retry strategies and configurations.

### The Thundering Herd Problem

The thundering herd problem occurs when many clients simultaneously retry failed requests to a recovering service, overwhelming it and preventing recovery. This typically happens when:

- A service experiences a brief outage affecting many clients at once
- All clients fail simultaneously and begin retrying
- Without randomization, all clients retry at exactly the same intervals
- The synchronized retry attempts overwhelm the recovering service
- The service continues to fail, triggering more synchronized retries

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

### Retry Amplification in Distributed Systems

Retry amplification occurs when retries cascade through multiple layers of a distributed system, multiplying the actual request load. This is a critical concern in microservices architectures.

**The Amplification Effect:**

Consider a system where Service A calls Service B, which calls Service C:

```text
User → Service A (retries 3x) → Service B (retries 3x) → Service C
```

If Service C fails, Service B retries 3 times per request. Service A retries 3 times per request to Service B. This means Service C receives up to 9 requests (3 × 3) for a single user request.

With deeper call chains, this grows exponentially:
- 2 services with 3 retries each: 9 requests
- 3 services with 3 retries each: 27 requests
- 4 services with 3 retries each: 81 requests

**Mitigation Strategies:**

1. **Reduce retries at higher layers:**
```ts
// Service A (user-facing): more retries for better UX
const serviceA = new AsyncRetryer(callServiceB, {
  maxAttempts: 5
})

// Service B (internal): fewer retries to prevent amplification
const serviceB = new AsyncRetryer(callServiceC, {
  maxAttempts: 2
})
```

2. **Use timeout budgets to limit total retry time:**
```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 3,
  maxTotalExecutionTime: 5000 // Limit total time regardless of retries
})
```

### Cost Considerations

Retries have real costs that should factor into your retry strategy:

**Network Costs:**
- Each retry consumes bandwidth
- Mobile users may have limited or metered data
- Cloud services may charge for bandwidth

**Time Costs:**
- Users wait longer for results
- Longer waits hurt user experience
- Time spent retrying could be spent on other requests

**Resource Costs:**
- Memory for pending operations
- CPU for processing retries
- Connection pool exhaustion
- Thread/worker saturation

**Example: Failing Fast Based on Error Type:**

You can use dynamic `maxAttempts` to adjust retry behavior based on error conditions:

```ts
// Your async function that throws errors with status codes
async function fetchData(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    const error = new Error('Request failed')
    ;(error as any).status = response.status
    throw error
  }
  return response.json()
}

const retryer = new AsyncRetryer(fetchData, {
  maxAttempts: (retryer) => {
    const error = retryer.store.state.lastError as any
    
    // Don't retry client errors (400-499)
    if (error?.status >= 400 && error?.status < 500) {
      return 1 // No retries
    }
    
    // Retry server errors (500-599)
    return 3
  }
})
```

## Async Retrying in TanStack Pacer

TanStack Pacer provides async retrying through the `asyncRetry` function and the more powerful `AsyncRetryer` class.

### Basic Usage with `asyncRetry`

The `asyncRetry` function provides a simple way to add retry functionality to any async function:

```ts
import { asyncRetry } from '@tanstack/pacer'

// Create a retry-enabled version of your async function
const fetchWithRetry = asyncRetry(
  async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Request failed')
    return response.json()
  },
  {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 1000
  }
)

// Usage
try {
  const data = await fetchWithRetry('/api/data')
  console.log('Success:', data)
} catch (error) {
  console.error('All retries failed:', error)
}
```

For more control over retry behavior, use the `AsyncRetryer` class directly.

### Advanced Usage with `AsyncRetryer` Class

The `AsyncRetryer` class provides complete control over retry behavior:

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
    }
  }
)

// Execute the function with retry logic
const data = await retryer.execute('/api/data')
```

> **Note:** When using React, prefer `useAsyncRetryer` hook over the `asyncRetry` function for better integration with React's lifecycle and automatic cleanup.

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
  maxExecutionTime: 5000 // Abort individual calls after 5 seconds
})
```

If a single execution exceeds this time, it will be aborted and retried (if attempts remain).

### Total Execution Timeout

The `maxTotalExecutionTime` option sets the maximum time for the entire retry operation:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 5,
  baseWait: 1000,
  maxTotalExecutionTime: 30000 // Abort entire operation after 30 seconds
})
```

If the total time across all attempts exceeds this limit, the retry operation will be aborted.

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
  }
})
```

### Callback Execution Order

The callbacks are executed in the following order:

```text
1. execute() called
2. Try attempt 1
   └─ If fails:
      ├─ onRetry(1, error) called
      └─ Wait for backoff
3. Try attempt 2
   └─ If fails:
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
  baseWait: 1000
})

// Start execution
const promise = retryer.execute()

// Cancel execution and pending retries
retryer.abort()

// The promise will resolve to undefined
const result = await promise
console.log(result) // undefined
```

### Automatic Cleanup

When using framework adapters, cleanup is handled automatically:

```tsx
// React example
function MyComponent() {
  const retryer = useAsyncRetryer(asyncFn, { maxAttempts: 3 })
  
  // Automatically calls abort() on unmount
  return <button onClick={() => retryer.execute()}>Execute</button>
}
```

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

The `AsyncRetryer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and retry statistics. All state is stored in a TanStack Store and can be accessed via `asyncRetryer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncRetryer.state` along with providing a selector callback as the 3rd argument to the `useAsyncRetryer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `retryer.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```tsx
// Default behavior - no reactive state subscriptions
const retryer = useAsyncRetryer(asyncFn, { maxAttempts: 3 })
console.log(retryer.state) // {}

// Opt-in to re-render when execution state changes
const retryer = useAsyncRetryer(
  asyncFn, 
  { maxAttempts: 3 },
  (state) => ({ 
    isExecuting: state.isExecuting,
    currentAttempt: state.currentAttempt 
  })
)
console.log(retryer.state.isExecuting) // Reactive value
console.log(retryer.state.currentAttempt) // Reactive value

// Opt-in to re-render when results are available
const retryer = useAsyncRetryer(
  asyncFn,
  { maxAttempts: 3 },
  (state) => ({
    lastResult: state.lastResult,
    lastError: state.lastError,
    status: state.status
  })
)
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

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `retryer.store.state` into reactive state with a custom selector wherever you want if necessary.

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

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async retrying functionality to integrate with the framework's state management system. Hooks like `createAsyncRetryer`, `useAsyncRetryer`, or similar are available for each framework.

### React Example

```tsx
import { useAsyncRetryer } from '@tanstack/react-pacer'

function DataFetcher() {
  const retryer = useAsyncRetryer(
    async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    {
      maxAttempts: 5,
      backoff: 'exponential',
      baseWait: 1000,
      jitter: 0.1,
      maxExecutionTime: 5000,
      onRetry: (attempt) => console.log(`Retry attempt ${attempt}`)
    },
    (state) => ({
      isExecuting: state.isExecuting,
      currentAttempt: state.currentAttempt,
      lastError: state.lastError,
      lastResult: state.lastResult
    })
  )

  const handleFetch = async () => {
    try {
      const user = await retryer.execute('user123')
      console.log('User:', user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  return (
    <div>
      <button onClick={handleFetch} disabled={retryer.state.isExecuting}>
        {retryer.state.isExecuting
          ? `Fetching... (attempt ${retryer.state.currentAttempt})`
          : 'Fetch User'}
      </button>
      {retryer.state.lastError && (
        <p>Error: {retryer.state.lastError.message}</p>
      )}
      {retryer.state.lastResult && (
        <pre>{JSON.stringify(retryer.state.lastResult, null, 2)}</pre>
      )}
    </div>
  )
}
```

## Best Practices

### 1. Choose the Right Backoff Strategy

- Use **exponential** backoff for most scenarios (default)
- Use **linear** backoff when you want slower growth in wait times
- Use **fixed** backoff when you have strict timing requirements

### 2. Add Jitter for Distributed Systems

When multiple clients might retry at the same time, add jitter to prevent thundering herd:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  jitter: 0.2 // Add 20% random variation
})
```

### 3. Set Appropriate Timeouts

Always set timeouts to prevent hanging operations:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxExecutionTime: 5000, // Individual call timeout
  maxTotalExecutionTime: 30000 // Overall operation timeout
})
```

### 4. Use Callbacks for Side Effects

Instead of wrapping the retryer in try-catch, use callbacks for cleaner code:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  onSuccess: (result) => {
    // Update UI, cache result, etc.
  },
  onError: (error) => {
    // Log error, show notification, etc.
  },
  throwOnError: false // Don't throw, handle via callbacks
})
```

### 5. Make Operations Idempotent

Ensure your operations can be safely retried without side effects:

```ts
// Good: Idempotent operation
const retryer = new AsyncRetryer(
  async (userId: string) => {
    // GET request is idempotent
    return await fetch(`/api/users/${userId}`)
  }
)

// Be careful: Non-idempotent operation
const retryer = new AsyncRetryer(
  async (amount: number) => {
    // POST request that creates a charge
    // Could charge multiple times if retried!
    return await fetch('/api/charge', {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
  }
)
```

### 6. Adjust Retry Count Based on Error Type

Some errors should retry more or less than others:

```ts
const retryer = new AsyncRetryer(
  async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      const error = new Error('Request failed')
      error.status = response.status
      throw error
    }
    return response.json()
  },
  {
    maxAttempts: (retryer) => {
      const lastError = retryer.store.state.lastError
      // Don't retry 4xx client errors
      if (lastError?.status >= 400 && lastError?.status < 500) {
        return 1
      }
      // Retry 5xx server errors more times
      return 5
    }
  }
)
```

