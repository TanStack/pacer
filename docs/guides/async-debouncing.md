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
- You can track error counts using `getErrorCount()` and check execution state with `getIsExecuting()`
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
    console.log('Async function executed', debouncer.getSuccessCount())
  },
  onSettled: (debouncer) => {
    // Called after each execution attempt
    console.log('Async function settled', debouncer.getSettledCount())
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

---

For core debouncing concepts and synchronous debouncing, see the [Debouncing Guide](../debouncing.md). 