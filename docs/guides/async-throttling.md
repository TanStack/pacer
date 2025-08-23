---
title: Async Throttling Guide
id: async-throttling
---

All core concepts from the [Throttling Guide](../throttling.md) apply to async throttling as well.

## When to Use Async Throttling

You can usually just use the normal synchronous throttler and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a throttled function (instead of just calling a setState side effect), or putting your error handling logic in the throttler, you can use the async throttler.

## Async Throttling in TanStack Pacer

TanStack Pacer provides async throttling through the `AsyncThrottler` class and the `asyncThrottle` function.

### Basic Usage Example

Here's a basic example showing how to use the async throttler for a search operation:

```ts
const throttledSearch = asyncThrottle(
  async (searchTerm: string) => {
    const results = await fetchSearchResults(searchTerm)
    return results
  },
  {
    wait: 500,
    onSuccess: (results, args, throttler) => {
      console.log('Search succeeded:', results)
      console.log('Search arguments:', args)
    },
    onError: (error, args, throttler) => {
      console.error('Search failed:', error)
      console.log('Failed arguments:', args)
    }
  }
)

// Usage
try {
  const results = await throttledSearch('query')
  // Handle successful results
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('Search failed:', error)
}
```

> **Note:** When using React, prefer `useAsyncThrottledCallback` hook over the `asyncThrottle` function for better integration with React's lifecycle and automatic cleanup.

## Key Differences from Synchronous Throttling

### 1. Return Value Handling

Unlike the synchronous throttler which returns void, the async version allows you to capture and use the return value from your throttled function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

### 2. Error Handling

The async throttler provides robust error handling capabilities:
- If your throttled function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `throttler.store.state.errorCount` and check execution state with `throttler.store.state.isExecuting`
- The throttler maintains its state and can continue to be used after an error occurs

### 3. Different Callbacks

The `AsyncThrottler` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and throttler instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and throttler instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the throttler instance

Example:

```ts
const asyncThrottler = new AsyncThrottler(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, args, throttler) => {
    // Called after each successful execution
    console.log('Async function executed', throttler.store.state.successCount)
    console.log('Executed arguments:', args)
  },
  onSettled: (args, throttler) => {
    // Called after each execution attempt
    console.log('Async function settled', throttler.store.state.settleCount)
    console.log('Settled arguments:', args)
  },
  onError: (error, args, throttler) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
    console.log('Failed arguments:', args)
  }
})
```

### 4. Sequential Execution

Since the throttler's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

## Dynamic Options and Enabling/Disabling

Just like the synchronous throttler, the async throttler supports dynamic options for `wait` and `enabled`, which can be functions that receive the throttler instance. This allows for sophisticated, runtime-adaptive throttling behavior.

### Flushing Pending Executions

The async throttler supports flushing pending executions to trigger them immediately:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 1000 })

asyncThrottler.maybeExecute('some-arg')
console.log(asyncThrottler.store.state.isPending) // true

// Flush immediately instead of waiting
asyncThrottler.flush()
console.log(asyncThrottler.store.state.isPending) // false
```

## State Management

The `AsyncThrottler` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and timing information. All state is stored in a TanStack Store and can be accessed via `asyncThrottler.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncThrottler.state` along with providing a selector callback as the 3rd argument to the `useAsyncThrottler` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `throttler.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncThrottler = useAsyncThrottler(asyncFn, { wait: 500 })
console.log(asyncThrottler.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncThrottler = useAsyncThrottler(
  asyncFn, 
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncThrottler.state.isExecuting) // Reactive value

// Multiple state properties
const asyncThrottler = useAsyncThrottler(
  asyncFn,
  { wait: 500 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async throttler. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-throttler-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncThrottler = new AsyncThrottler(asyncFn, {
  wait: 500,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncThrottler.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `throttler.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `AsyncThrottlerState` includes:

- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the throttled function is currently executing asynchronously
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async throttling functionality to integrate with the framework's state management system. Hooks like `createAsyncThrottler`, `useAsyncThrottledCallback`, or similar are available for each framework.

---

For core throttling concepts and synchronous throttling, see the [Throttling Guide](../throttling.md). 