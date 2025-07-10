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
    onSuccess: (results, throttler) => {
      console.log('Search succeeded:', results)
    },
    onError: (error, throttler) => {
      console.error('Search failed:', error)
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
- `onSuccess`: Called after each successful execution, providing the result and throttler instance
- `onSettled`: Called after each execution (success or failure), providing the throttler instance
- `onError`: Called if the async function throws an error, providing both the error and the throttler instance

Example:

```ts
const asyncThrottler = new AsyncThrottler(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, throttler) => {
    // Called after each successful execution
    console.log('Async function executed', throttler.store.state.successCount)
  },
  onSettled: (throttler) => {
    // Called after each execution attempt
    console.log('Async function settled', throttler.store.state.settleCount)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

### 4. Sequential Execution

Since the throttler's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

## Dynamic Options and Enabling/Disabling

Just like the synchronous throttler, the async throttler supports dynamic options for `wait` and `enabled`, which can be functions that receive the throttler instance. This allows for sophisticated, runtime-adaptive throttling behavior.

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async throttling functionality to integrate with the framework's state management system. Hooks like `createAsyncThrottler`, `useAsyncThrottledCallback`, or similar are available for each framework.

## State Management

The `AsyncThrottler` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and timing information.

### Accessing State

When using the `AsyncThrottler` class directly, access state via the `store.state` property:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 500 })

// Access current state
console.log(asyncThrottler.store.state.successCount)
```

### Framework Adapters

When using framework adapters like React or Solid, the state is exposed directly as a reactive property:

```ts
// React example
const asyncThrottler = useAsyncThrottler(asyncFn, { wait: 500 })

// Access state directly (reactive)
console.log(asyncThrottler.state.successCount) // Reactive value
console.log(asyncThrottler.state.isExecuting) // Reactive value
```

### Initial State

You can provide initial state values when creating an async throttler:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, {
  wait: 500,
  initialState: {
    successCount: 3, // Start with 3 successful executions
    errorCount: 1, // Start with 1 error
    lastResult: 'initial-result', // Start with initial result
    lastExecutionTime: Date.now() - 1000, // Set last execution to 1 second ago
  }
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncThrottler.store.subscribe((state) => {
  console.log('Success count:', state.successCount)
  console.log('Error count:', state.errorCount)
  console.log('Currently executing:', state.isExecuting)
  console.log('Last execution time:', state.lastExecutionTime)
})

// Unsubscribe when done
unsubscribe()
```

### Available State Properties

The `AsyncThrottlerState` includes:

- `successCount`: Number of successful function executions
- `errorCount`: Number of failed function executions
- `settleCount`: Total number of completed executions (success + error)
- `isExecuting`: Whether the async function is currently executing
- `isPending`: Whether the throttler is waiting for timeout to trigger execution
- `status`: Current execution status ('idle' | 'pending' | 'executing' | 'settled')
- `lastExecutionTime`: Timestamp of the last function execution (in milliseconds)
- `nextExecutionTime`: Timestamp when the next execution can occur (in milliseconds)
- `lastResult`: Result from the most recent successful execution
- `lastArgs`: Arguments from the most recent call to `maybeExecute`

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

---

For core throttling concepts and synchronous throttling, see the [Throttling Guide](../throttling.md). 