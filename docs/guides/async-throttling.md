---
title: Async Throttling Guide
id: async-throttling
---

All core concepts from the [Throttling Guide](./throttling.md) apply to async throttling as well.

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

## Advanced Features: Retry and Abort Support

The async throttler includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

### Retry Support

Configure automatic retries for failed throttled function executions using the `asyncRetryerOptions`:

```ts
const throttledSave = asyncThrottle(
  async (data: string) => {
    // This might fail due to network issues
    await api.save(data)
  },
  {
    wait: 1000,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retrying.md).

### Abort Support

Cancel in-flight throttled executions using the abort functionality:

```ts
const throttler = new AsyncThrottler(
  async (data: string) => {
    // Access the abort signal for this execution
    const signal = throttler.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: data,
        signal
      })
      return response.json()
    }
  },
  { wait: 1000 }
)

// Start an operation
throttler.maybeExecute('data')

// Later, abort any in-flight execution
throttler.abort()
```

The abort functionality:
- Cancels all ongoing throttled executions using AbortController
- Does NOT cancel pending executions that haven't started yet (use `cancel()` for that)
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your throttled function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retrying.md).

### Sharing Options Between Instances

Use `asyncThrottlerOptions` to share common options between different `AsyncThrottler` instances:

```ts
import { asyncThrottlerOptions, AsyncThrottler } from '@tanstack/pacer'

const sharedOptions = asyncThrottlerOptions({
  wait: 500,
  leading: true,
  trailing: true,
  onSuccess: (result, args, throttler) => console.log('Success')
})

const throttler1 = new AsyncThrottler(fn1, { ...sharedOptions, key: 'throttler1' })
const throttler2 = new AsyncThrottler(fn2, { ...sharedOptions, wait: 1000 })
```

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

### Customizing Unmount Behavior

Framework hooks cancel any pending execution and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const throttler = useAsyncThrottler(fn, {
  wait: 500,
  onUnmount: (t) => t.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your throttled function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

## State Management

The `AsyncThrottler` class uses TanStack Store for reactive state management, providing real-time access to execution state, error tracking, and timing information. All state is stored in a TanStack Store and can be accessed via `asyncThrottler.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncThrottler.state` along with providing a selector callback as the 3rd argument to the `useAsyncThrottler` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncThrottler.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncThrottler = useAsyncThrottler(asyncFn, { wait: 500 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncThrottler.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state.isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</asyncThrottler.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncThrottler.state` is empty (`{}`) as the selector is empty by default.** This is where reactive state from a TanStack Store `useStore` gets stored. You must opt-in to state tracking by providing a selector function.

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

For core throttling concepts and synchronous throttling, see the [Throttling Guide](./throttling.md). 