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
- You can track error counts using `getErrorCount()` and check execution state with `getIsExecuting()`
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
    console.log('Async function executed', throttler.getSuccessCount())
  },
  onSettled: (throttler) => {
    // Called after each execution attempt
    console.log('Async function settled', throttler.getSettledCount())
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

---

For core throttling concepts and synchronous throttling, see the [Throttling Guide](./throttling.md). 