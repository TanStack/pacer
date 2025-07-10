---
title: Async Debouncing Guide
id: async-debouncing
---

All core concepts from the [Debouncing Guide](../debouncing.md) apply to async debouncing as well. 

## When to Use Async Debouncing

You can usually just use the normal synchronous debouncer and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a debounced function (instead of just calling a setState side effect), or putting your error handling logic in the debouncer, you can use the async debouncer.

## Async Debouncing in TanStack Pacer

TanStack Pacer provides async debouncing through the `AsyncDebouncer` class and the `asyncDebounce` function.

### Basic Usage Example

Here's a basic example showing how to use the async debouncer for a search operation:

```ts
const debouncedSearch = asyncDebounce(
  async (searchTerm: string) => {
    const results = await fetchSearchResults(searchTerm)
    return results
  },
  {
    wait: 500,
    onSuccess: (results, debouncer) => {
      console.log('Search succeeded:', results)
    },
    onError: (error, debouncer) => {
      console.error('Search failed:', error)
    }
  }
)

// Usage
try {
  const results = await debouncedSearch('query')
  // Handle successful results
} catch (error) {
  // Handle errors if no onError handler was provided
  console.error('Search failed:', error)
}
```

## Key Differences from Synchronous Debouncing

### 1. Return Value Handling

Unlike the synchronous debouncer which returns void, the async version allows you to capture and use the return value from your debounced function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

### 2. Error Handling

The async debouncer provides robust error handling capabilities:
- If your debounced function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `debouncer.store.state.errorCount` and check execution state with `debouncer.store.state.isExecuting`
- The debouncer maintains its state and can continue to be used after an error occurs

### 3. Different Callbacks

The `AsyncDebouncer` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result and debouncer instance
- `onSettled`: Called after each execution (success or failure), providing the debouncer instance
- `onError`: Called if the async function throws an error, providing both the error and the debouncer instance

Example:

```ts
const asyncDebouncer = new AsyncDebouncer(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, debouncer) => {
    // Called after each successful execution
    console.log('Async function executed', debouncer.store.state.successCount)
  },
  onSettled: (debouncer) => {
    // Called after each execution attempt
    console.log('Async function settled', debouncer.store.state.settleCount)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

### 4. Sequential Execution

Since the debouncer's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.

## Dynamic Options and Enabling/Disabling

Just like the synchronous debouncer, the async debouncer supports dynamic options for `wait` and `enabled`, which can be functions that receive the debouncer instance. This allows for sophisticated, runtime-adaptive debouncing behavior.

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async debouncing functionality to integrate with the framework's state management system. Hooks like `createAsyncDebouncer`, `useAsyncDebouncedCallback`, or similar are available for each framework.

## State Management

The `AsyncDebouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and execution statistics.

### Accessing State

When using the `AsyncDebouncer` class directly, access state via the `store.state` property:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 500 })

// Access current state
console.log(asyncDebouncer.store.state.isPending) // Number of successful executions
```

### Framework Adapters

When using framework adapters like React or Solid, the state is exposed directly as a reactive property:

```ts
// React example
const asyncDebouncer = useAsyncDebouncer(asyncFn, { wait: 500 })

// Access state directly (reactive)
console.log(asyncDebouncer.state.successCount) // Reactive value
console.log(asyncDebouncer.state.isExecuting) // Reactive value
```

### Initial State

You can provide initial state values when creating an async debouncer:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, {
  wait: 500,
  initialState: {
    successCount: 3, // Start with 3 successful executions
    errorCount: 1, // Start with 1 error
    lastResult: 'initial-result', // Start with initial result
  }
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncDebouncer.store.subscribe((state) => {
  console.log('Success count:', state.successCount)
  console.log('Error count:', state.errorCount)
  console.log('Currently executing:', state.isExecuting)
})

// Unsubscribe when done
unsubscribe()
```

### Available State Properties

The `AsyncDebouncerState` includes:

- `successCount`: Number of successful function executions
- `errorCount`: Number of failed function executions
- `settleCount`: Total number of completed executions (success + error)
- `isExecuting`: Whether the async function is currently executing
- `isPending`: Whether the debouncer is waiting for timeout to trigger execution
- `status`: Current execution status ('idle' | 'pending' | 'executing' | 'settled')
- `canLeadingExecute`: Whether leading edge execution is allowed
- `lastResult`: Result from the most recent successful execution
- `lastArgs`: Arguments from the most recent call to `maybeExecute`

### Flushing Pending Executions

The async debouncer supports flushing pending executions to trigger them immediately:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 1000 })

asyncDebouncer.maybeExecute('some-arg')
console.log(asyncDebouncer.store.state.isPending) // true

// Flush immediately instead of waiting
asyncDebouncer.flush()
console.log(asyncDebouncer.store.state.isPending) // false
```

---

For core debouncing concepts and synchronous debouncing, see the [Debouncing Guide](../debouncing.md). 