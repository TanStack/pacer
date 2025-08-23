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
    onSuccess: (results, args, debouncer) => {
      console.log('Search succeeded:', results)
      console.log('Search arguments:', args)
    },
      onError: (error, args, debouncer) => {
    console.error('Search failed:', error)
    console.log('Failed arguments:', args)
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

> **Note:** When using React, prefer `useAsyncDebouncedCallback` hook over the `asyncDebounce` function for better integration with React's lifecycle and automatic cleanup.

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
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and debouncer instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and debouncer instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the debouncer instance

Example:

```ts
const asyncDebouncer = new AsyncDebouncer(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, args, debouncer) => {
    // Called after each successful execution
    console.log('Async function executed', debouncer.store.state.successCount)
    console.log('Executed arguments:', args)
  },
  onSettled: (args, debouncer) => {
    // Called after each execution attempt
    console.log('Async function settled', debouncer.store.state.settleCount)
    console.log('Settled arguments:', args)
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

## State Management

The `AsyncDebouncer` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and execution statistics. All state is stored in a TanStack Store and can be accessed via `asyncDebouncer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncDebouncer.state` along with providing a selector callback as the 3rd argument to the `useAsyncDebouncer` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support a `selector` argument that allows you to specify which state changes will trigger re-renders. This optimizes performance by preventing unnecessary re-renders when irrelevant state changes occur.

**By default, `debouncer.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const asyncDebouncer = useAsyncDebouncer(asyncFn, { wait: 500 })
console.log(asyncDebouncer.state) // {}

// Opt-in to re-render when isExecuting changes
const asyncDebouncer = useAsyncDebouncer(
  asyncFn, 
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(asyncDebouncer.state.isExecuting) // Reactive value

// Multiple state properties
const asyncDebouncer = useAsyncDebouncer(
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

You can provide initial state values when creating an async debouncer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-debouncer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const asyncDebouncer = new AsyncDebouncer(asyncFn, {
  wait: 500,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 500 })

// Subscribe to state changes
const unsubscribe = asyncDebouncer.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** This is unnecessary when using a framework adapter because the underlying `useStore` hook already does this. You can also import and use `useStore` from TanStack Store to turn `debouncer.store.state` into reactive state with a custom selector wherever you want if necessary.

### Available State Properties

The `AsyncDebouncerState` includes:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to `maybeExecute`
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times `maybeExecute` has been called
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async debouncing functionality to integrate with the framework's state management system. Hooks like `createAsyncDebouncer`, `useAsyncDebouncedCallback`, or similar are available for each framework.

---

For core debouncing concepts and synchronous debouncing, see the [Debouncing Guide](../debouncing.md).
