---
title: Async Rate Limiting Guide
id: async-rate-limiting
---

All core concepts from the [Rate Limiting Guide](../rate-limiting.md) apply to async rate limiting as well.

## When to Use Async Rate Limiting

You can usually just use the normal synchronous rate limiter and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a rate-limited function (instead of just calling a setState side effect), or putting your error handling logic in the rate limiter, you can use the async rate limiter.

## Async Rate Limiting in TanStack Pacer

TanStack Pacer provides async rate limiting through the `AsyncRateLimiter` class and the `asyncRateLimit` function.

### Basic Usage Example

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
      console.log('API call succeeded:', limiter.store.state.successCount)
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
try {
  const result = await rateLimitedApi('123')
  // Handle successful result
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('API call failed:', error)
}
```

> **Note:** When using React, prefer `useAsyncRateLimitedCallback` hook over the `asyncRateLimit` function for better integration with React's lifecycle and automatic cleanup.

## Key Differences from Synchronous Rate Limiting

### 1. Return Value Handling

Unlike the synchronous rate limiter which returns a boolean indicating success, the async version allows you to capture and use the return value from your rate-limited function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

### 2. Error Handling

The async rate limiter provides robust error handling capabilities:
- If your rate-limited function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `limiter.store.state.errorCount` and check execution state with `limiter.store.state.isExecuting`
- The rate limiter maintains its state and can continue to be used after an error occurs
- Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler

### 3. Different Callbacks

The `AsyncRateLimiter` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and rate limiter instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and rate limiter instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the rate limiter instance

Both the Async and Synchronous rate limiters support the `onReject` callback for handling blocked executions.

Example:

```ts
const asyncLimiter = new AsyncRateLimiter(async (id) => {
  await saveToAPI(id)
}, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Async function executed', rateLimiter.store.state.successCount)
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

### 4. Sequential Execution

Since the rate limiter's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

## Dynamic Options and Enabling/Disabling

Just like the synchronous rate limiter, the async rate limiter supports dynamic options for `limit`, `window`, and `enabled`, which can be functions that receive the rate limiter instance. This allows for sophisticated, runtime-adaptive rate limiting behavior.

## State Management

The `AsyncRateLimiter` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and rejection statistics. All state is stored in a TanStack Store and can be accessed via `asyncLimiter.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncLimiter.state` along with providing a selector callback as the 3rd argument to the `useAsyncRateLimiter` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `rateLimiter.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncLimiter = useAsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })
console.log(asyncLimiter.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncLimiter = useAsyncRateLimiter(
  asyncFn, 
  { limit: 5, window: 1000 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncLimiter.state.isExecuting) // Reactive value

// Multiple state properties
const asyncLimiter = useAsyncRateLimiter(
  asyncFn,
  { limit: 5, window: 1000 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async rate limiter:

```ts
const savedState = localStorage.getItem('async-rate-limiter-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncLimiter = new AsyncRateLimiter(asyncFn, {
  limit: 5,
  window: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncLimiter = new AsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// Subscribe to state changes
const unsubscribe = asyncLimiter.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `rateLimiter.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `AsyncRateLimiterState` includes:

- `errorCount`: Number of function executions that have resulted in errors
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExecuting`: Whether the rate-limited function is currently executing asynchronously
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `settledCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'exceeded' | 'idle')
- `successCount`: Number of function executions that have completed successfully

### Helper Methods

The async rate limiter provides helper methods that compute values based on the current state:

```ts
const asyncLimiter = new AsyncRateLimiter(asyncFn, { limit: 5, window: 1000 })

// These methods use the current state to compute values
console.log(asyncLimiter.getRemainingInWindow()) // Number of calls remaining in current window
console.log(asyncLimiter.getMsUntilNextWindow()) // Milliseconds until next window
```

These methods are computed values that use the current state and don't need to be accessed through the store.

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async rate limiting functionality to integrate with the framework's state management system. Hooks like `createAsyncRateLimiter`, `useAsyncRateLimitedCallback`, or similar are available for each framework.

---

For core rate limiting concepts and synchronous rate limiting, see the [Rate Limiting Guide](../rate-limiting.md). 