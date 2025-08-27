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

### Window Types

TanStack Pacer supports two types of rate limiting windows:

1. **Fixed Window** (default)
   - A strict window that resets after the window period
   - All executions within the window count towards the limit
   - The window resets completely after the period
   - Can lead to bursty behavior at window boundaries

2. **Sliding Window**
   - A rolling window that allows executions as old ones expire
   - Provides a more consistent rate of execution over time
   - Better for maintaining a steady flow of executions
   - Prevents bursty behavior at window boundaries

Here's a visualization of sliding window rate limiting:

```text
Sliding Window Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  |    Window 2            
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                             ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ✅                             ✅     ✅
             [=== 3 allowed ===][=== oldest expires, new allowed ===][=== continues sliding =======]
```

The key difference is that with a sliding window, as soon as the oldest execution expires, a new execution is allowed. This creates a more consistent flow of executions compared to the fixed window approach.

### When to Use Rate Limiting

Rate Limiting is particularly important when dealing with front-end operations that could accidentally overwhelm your back-end services or cause performance issues in the browser.

### When Not to Use Rate Limiting

Rate Limiting is the most naive approach to controlling function execution frequency. It is the least flexible and most restrictive of the three techniques. Consider using [throttling](../throttling.md) or [debouncing](../debouncing.md) instead for more spaced out executions.

> [!TIP]
> You most likely don't want to use "rate limiting" for most use cases. Consider using [throttling](../throttling.md) or [debouncing](../debouncing.md) instead. 

Rate Limiting's "lossy" nature also means that some executions will be rejected and lost. This can be a problem if you need to ensure that all executions are always successful. Consider using [queuing](../queuing.md) if you need to ensure that all executions are queued up to be executed, but with a throttled delay to slow down the rate of execution.

## Rate Limiting in TanStack Pacer

TanStack Pacer provides both synchronous and asynchronous rate limiting. This guide covers the synchronous `RateLimiter` class and `rateLimit` function. For async rate limiting, see the [Async Rate Limiting Guide](../async-rate-limiting.md).

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
    windowType: 'fixed', // default
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

> **Note:** When using React, prefer `useRateLimitedCallback` hook over the `rateLimit` function for better integration with React's lifecycle and automatic cleanup.

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
      console.log('Function executed', rateLimiter.store.state.executionCount)
    },
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
    }
  }
)

// Access current state via TanStack Store
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.store.state.executionCount) // Total number of successful executions
console.log(limiter.store.state.rejectionCount) // Total number of rejected executions

// Attempt to execute (returns boolean indicating success)
limiter.maybeExecute('user-1')

// Update options dynamically
limiter.setOptions({ limit: 10 }) // Increase the limit

// Reset all counters and state
limiter.reset()
```

### Enabling/Disabling

The `RateLimiter` class supports enabling/disabling via the `enabled` option. Using the `setOptions` method, you can enable/disable the rate limiter at any time:

> [!NOTE]
> The `enabled` option enables/disables the actual function execution. Disabling the rate limiter does not turn off rate limiting, it just prevents the function from being executed at all.

```ts
const limiter = new RateLimiter(fn, { 
  limit: 5, 
  window: 1000,
  enabled: false // Disable by default
})
limiter.setOptions({ enabled: true }) // Enable at any time
```

The `enabled` option can also be a function that returns a boolean, allowing for dynamic enabling/disabling based on runtime conditions:

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  enabled: (limiter) => {
    return limiter.store.state.executionCount < 100 // Disable after 100 executions
  }
})
```

If you are using a framework adapter where the rate limiter options are reactive, you can set the `enabled` option to a conditional value to enable/disable the rate limiter on the fly. However, if you are using the `rateLimit` function or the `RateLimiter` class directly, you must use the `setOptions` method to change the `enabled` option, since the options that are passed are actually passed to the constructor of the `RateLimiter` class.

### Dynamic Options

Several options in the RateLimiter support dynamic values through callback functions that receive the rate limiter instance:

```ts
const limiter = new RateLimiter(fn, {
  // Dynamic limit based on execution count
  limit: (limiter) => {
    return Math.max(1, 10 - limiter.store.state.executionCount) // Decrease limit with each execution
  },
  // Dynamic window based on execution count
  window: (limiter) => {
    return limiter.store.state.executionCount * 1000 // Increase window with each execution
  },
  // Dynamic enabled state based on execution count
  enabled: (limiter) => {
    return limiter.store.state.executionCount < 100 // Disable after 100 executions
  }
})
```

The following options support dynamic values:
- `enabled`: Can be a boolean or a function that returns a boolean
- `limit`: Can be a number or a function that returns a number
- `window`: Can be a number or a function that returns a number

This allows for sophisticated rate limiting behavior that adapts to runtime conditions.

### Callback Options

The synchronous `RateLimiter` supports the following callbacks:

```ts
const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Function executed', rateLimiter.store.state.executionCount)
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  }
})
```

The `onExecute` callback is called after each successful execution of the rate-limited function, while the `onReject` callback is called when an execution is rejected due to rate limiting. These callbacks are useful for tracking executions, updating UI state, or providing feedback to users.

## State Management

The `RateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `limiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `limiter.state` along with providing a selector callback as the 3rd argument to the `useRateLimiter` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `rateLimiter.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const limiter = useRateLimiter(fn, { limit: 5, window: 1000 })
console.log(limiter.state) // {}

// Opt-in to re-render when rejectionCount changes
const limiter = useRateLimiter(
  fn, 
  { limit: 5, window: 1000 },
  (state) => ({ rejectionCount: state.rejectionCount })
)
console.log(limiter.state.rejectionCount) // Reactive value

// Multiple state properties
const limiter = useRateLimiter(
  fn,
  { limit: 5, window: 1000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    status: state.status
  })
)
```

### Initial State

You can provide initial state values when creating a rate limiter. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('rate-limiter-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const limiter = new RateLimiter(fn, {
  limit: 5,
  window: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const limiter = new RateLimiter(fn, { limit: 5, window: 1000 })

// Subscribe to state changes
const unsubscribe = limiter.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `rateLimiter.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `RateLimiterState` includes:

- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExceeded`: Whether the rate limiter has exceeded the limit
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `status`: Current execution status ('disabled' | 'exceeded' | 'idle')

### Helper Methods

The rate limiter provides helper methods that compute values based on the current state:

```ts
const limiter = new RateLimiter(fn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(limiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(limiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.

## Framework Adapters

Each framework adapter builds convenient hooks and functions around the rate limiter classes. Hooks like `useRateLimiter`, or `createRateLimiter` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous rate limiting (e.g., API calls, async operations), see the [Async Rate Limiting Guide](../async-rate-limiting.md).