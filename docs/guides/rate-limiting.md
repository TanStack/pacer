---
title: Rate Limiting Guide
id: rate-limiting
---

Rate Limiting, Throttling, and Debouncing are three distinct approaches to controlling function execution frequency. Each technique blocks executions differently, making them "lossy" - meaning some function calls will not execute when they are requested to run too frequently. Understanding when to use each approach is crucial for building performant and reliable applications. This guide will cover the Rate Limiting concepts of TanStack Pacer.

> [!NOTE]
> TanStack Pacer is currently only a front-end library. These are utilities for client-side rate-limiting.

## Rate Limiting Concept

Rate Limiting is a technique that limits the rate at which a function can execute over a specific time window. It is particularly useful for scenarios where you want to prevent a function from being called too frequently, such as when handling API requests or other external service calls. It is the most *naive* approach, as it allows executions to happen in bursts until the quota is met.

### Rate Limiting Visualization

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2            
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                             ✅     ✅
             [=== 3 allowed ===][=== blocked until window ends ===][=== new window =======]
```

### When to Use Rate Limiting

Rate Limiting is particularly important when dealing with front-end operations that could accidentally overwhelm your back-end services or cause performance issues in the browser.

Common use cases include:
- Preventing accidental API spam from rapid user interactions (e.g., button clicks or form submissions)
- Scenarios where bursty behavior is acceptable but you want to cap the maximum rate
- Protecting against accidental infinite loops or recursive operations

### When Not to Use Rate Limiting

Rate Limiting is the most naive approach to controlling function execution frequency. It is the least flexible and most restrictive of the three techniques. Consider using [throttling](../guides/throttling) or [debouncing](../guides/debouncing) instead for more spaced out executions.

> [!TIP]
> You most likely don't want to use "rate limiting" for most use cases. Consider using [throttling](../guides/throttling) or [debouncing](../guides/debouncing) instead. 

Rate Limiting's "lossy" nature also means that some executions will be rejected and lost. This can be a problem if you need to ensure that all executions are always successful. Consider using [queueing](../guides/queueing) if you need to ensure that all executions are queued up to be executed, but with a throttled delay to slow down the rate of execution.

## Rate Limiting in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous rate limiting through the `RateLimiter` and `AsyncRateLimiter` classes respectively (and their corresponding `rateLimit` and `asyncRateLimit` functions).

### Basic Usage with `rateLimit`

The `rateLimit` function is the simplest way to add rate limiting to any function. It's perfect for most use cases where you just need to enforce a simple limit.

```ts
import { rateLimit } from '@tanstack/pacer'

// Rate limit API calls to 5 per minute
const rateLimitedApi = rateLimit(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000, // 1 minute in milliseconds
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
    }
  }
)

// First 5 calls will execute immediately
rateLimitedApi('user-1') // ✅ Executes
rateLimitedApi('user-2') // ✅ Executes
rateLimitedApi('user-3') // ✅ Executes
rateLimitedApi('user-4') // ✅ Executes
rateLimitedApi('user-5') // ✅ Executes
rateLimitedApi('user-6') // ❌ Rejected until window resets
```

### Advanced Usage with `RateLimiter` Class

For more complex scenarios where you need additional control over the rate limiting behavior, you can use the `RateLimiter` class directly. This gives you access to additional methods and state information.

```ts
import { RateLimiter } from '@tanstack/pacer'

// Create a rate limiter instance
const limiter = new RateLimiter(
  (id: string) => fetchUserData(id),
  {
    limit: 5,
    window: 60 * 1000,
    onExecute: (rateLimiter) => {
      console.log('Function executed', rateLimiter.getExecutionCount())
    },
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
    }
  }
)

// Get information about current state
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.getExecutionCount()) // Total number of successful executions
console.log(limiter.getRejectionCount()) // Total number of rejected executions

// Attempt to execute (returns boolean indicating success)
limiter.maybeExecute('user-1')

// Update options dynamically
limiter.setOptions({ limit: 10 }) // Increase the limit

// Reset all counters and state
limiter.reset()
```

### Enabling/Disabling

The `RateLimiter` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the rate limiter at any time:

```ts
const limiter = new RateLimiter(fn, { 
  limit: 5, 
  window: 1000,
  enabled: false // Disable by default
})
limiter.setOptions({ enabled: true }) // Enable at any time
```

If you are using a framework adapter where the rate limiter options are reactive, you can set the `enabled` option to a conditional value to enable/disable the rate limiter on the fly. However, if you are using the `rateLimit` function or the `RateLimiter` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `RateLimiter` class.

### Callback Options

Both the synchronous and asynchronous rate limiters support callback options to handle different aspects of the rate limiting lifecycle:

#### Synchronous Rate Limiter Callbacks

The synchronous `RateLimiter` supports the following callbacks:

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Function executed', rateLimiter.getExecutionCount())
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  }
})
```

The `onExecute` callback is called after each successful execution of the rate-limited function, while the `onReject` callback is called when an execution is rejected due to rate limiting. These callbacks are useful for tracking executions, updating UI state, or providing feedback to users.

#### Asynchronous Rate Limiter Callbacks

The asynchronous `AsyncRateLimiter` supports additional callbacks for error handling:

```ts
const asyncLimiter = new AsyncRateLimiter(async (id) => {
  await saveToAPI(id)
}, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Async function executed', rateLimiter.getExecutionCount())
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

The `onExecute` and `onReject` callbacks work the same way as in the synchronous rate limiter, while the `onError` callback allows you to handle errors gracefully without breaking the rate limiting chain. These callbacks are particularly useful for tracking execution counts, updating UI state, handling errors, and providing feedback to users.

### Asynchronous Rate Limiting

The async rate limiter provides a powerful way to handle asynchronous operations with rate limiting, offering several key advantages over the synchronous version. While the synchronous rate limiter is great for UI events and immediate feedback, the async version is specifically designed for handling API calls, database operations, and other asynchronous tasks.

#### Key Differences from Synchronous Rate Limiting

1. **Return Value Handling**
Unlike the synchronous rate limiter which returns a boolean indicating success, the async version allows you to capture and use the return value from your rate-limited function. This is particularly useful when you need to work with the results of API calls or other async operations. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

2. **Enhanced Callback System**
The async rate limiter provides a more sophisticated callback system compared to the synchronous version's callbacks. This system includes:
- `onExecute`: Called after each successful execution, providing the rate limiter instance
- `onReject`: Called when an execution is rejected due to rate limiting, providing the rate limiter instance
- `onError`: Called if the async function throws an error, providing both the error and the rate limiter instance

3. **Execution Tracking**
The async rate limiter provides comprehensive execution tracking through several methods:
- `getExecutionCount()`: Number of successful executions
- `getRejectionCount()`: Number of rejected executions
- `getRemainingInWindow()`: Number of executions remaining in current window
- `getMsUntilNextWindow()`: Milliseconds until the next window starts

4. **Sequential Execution**
The async rate limiter ensures that subsequent executions wait for the previous call to complete before starting. This prevents out-of-order execution and guarantees that each call processes the most up-to-date data. This is particularly important when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, the async rate limiter will ensure the fetch operation waits for the update to complete, preventing race conditions where you might get stale data.

#### Basic Usage Example

Here's a basic example showing how to use the async rate limiter for an API operation:

```ts
const rateLimitedApi = asyncRateLimit(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`)
    return response.json()
  },
  {
    limit: 5,
    window: 1000,
    onExecute: (limiter) => {
      console.log('API call succeeded:', limiter.getExecutionCount())
    },
    onReject: (limiter) => {
      console.log(`Rate limit exceeded. Try again in ${limiter.getMsUntilNextWindow()}ms`)
    },
    onError: (error, limiter) => {
      console.error('API call failed:', error)
    }
  }
)

// Usage
const result = await rateLimitedApi('123')
```

#### Advanced Patterns

The async rate limiter can be combined with various patterns to solve complex problems:

1. **State Management Integration**
When using the async rate limiter with state management systems (like React's useState or Solid's createSignal), you can create powerful patterns for handling loading states, error states, and data updates. The rate limiter's callbacks provide perfect hooks for updating UI state based on the success or failure of operations.

2. **Race Condition Prevention**
The rate limiting pattern naturally prevents race conditions in many scenarios. When multiple parts of your application try to update the same resource simultaneously, the rate limiter ensures that updates occur within the configured limits, while still providing results to all callers.

3. **Error Recovery**
The async rate limiter's error handling capabilities make it ideal for implementing retry logic and error recovery patterns. You can use the `onError` callback to implement custom error handling strategies, such as exponential backoff or fallback mechanisms.

### Framework Adapters

Each framework adapter provides hooks that build on top of the core rate limiting functionality to integrate with the framework's state management system. Hooks like `createRateLimiter`, `useRateLimitedCallback`, `useRateLimitedState`, or `useRateLimitedValue` are available for each framework.

Here are some examples:

#### React

```tsx
import { useRateLimiter, useRateLimitedCallback, useRateLimitedValue } from '@tanstack/react-pacer'

// Low-level hook for full control
const limiter = useRateLimiter(
  (id: string) => fetchUserData(id),
  { limit: 5, window: 1000 }
)

// Simple callback hook for basic use cases
const handleFetch = useRateLimitedCallback(
  (id: string) => fetchUserData(id),
  { limit: 5, window: 1000 }
)

// State-based hook for reactive state management
const [instantState, setInstantState] = useState('')
const [rateLimitedValue] = useRateLimitedValue(
  instantState, // Value to rate limit
  { limit: 5, window: 1000 }
)
```

#### Solid

```tsx
import { createRateLimiter, createRateLimitedSignal } from '@tanstack/solid-pacer'

// Low-level hook for full control
const limiter = createRateLimiter(
  (id: string) => fetchUserData(id),
  { limit: 5, window: 1000 }
)

// Signal-based hook for state management
const [value, setValue, limiter] = createRateLimitedSignal('', {
  limit: 5,
  window: 1000,
  onExecute: (limiter) => {
    console.log('Total executions:', limiter.getExecutionCount())
  }
})
```
