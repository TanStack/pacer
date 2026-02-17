---
id: createAsyncDebouncer
title: createAsyncDebouncer
---

# Function: createAsyncDebouncer()

```ts
function createAsyncDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector): SolidAsyncDebouncer<TFn, TSelected>;
```

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:174](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L174)

A low-level Solid hook that creates an `AsyncDebouncer` instance to delay execution of an async function.

This hook is designed to be flexible and state-management agnostic - it simply returns a debouncer instance that
you can integrate with any state management solution (createSignal, etc).

Async debouncing ensures that an async function only executes after a specified delay has passed since its last invocation.
Each new invocation resets the delay timer. This is useful for handling frequent events like window resizing
or input changes where you only want to execute the handler after the events have stopped occurring.

Unlike throttling which allows execution at regular intervals, debouncing prevents any execution until
the function stops being called for the specified delay period.

Unlike the non-async Debouncer, this async version supports returning values from the debounced function,
making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
instead of setting the result on a state variable from within the debounced function.

Error Handling:
- If an `onError` handler is provided, it will be called with the error and debouncer instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncDebouncer instance

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `debouncer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates
at the hook level, optimizing performance by preventing unnecessary updates when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
updates and gives you full control over when your component tracks state changes.

Available state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `hasError`: Whether the last execution resulted in an error
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `isExecuting`: Whether an async function execution is currently in progress
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastError`: The error from the most recent failed execution (if any)
- `lastResult`: The result from the most recent successful execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing')

## Unmount behavior

By default, the primitive cancels any pending execution when the owning component unmounts.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```tsx
const debouncer = createAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush()
});
```

Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
If your debounced function updates Solid signals, those updates may run after the component has
unmounted, which can cause unexpected reactive updates. Guard your callbacks accordingly when
using onUnmount with flush.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### options

[`SolidAsyncDebouncerOptions`](../interfaces/SolidAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>

### selector

(`state`) => `TSelected`

## Returns

[`SolidAsyncDebouncer`](../interfaces/SolidAsyncDebouncer.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const { maybeExecute } = createAsyncDebouncer(
  async (query: string) => {
    const results = await api.search(query);
    return results;
  },
  { wait: 500 }
);

// Opt-in to track isPending or isExecuting changes (optimized for loading states)
const debouncer = createAsyncDebouncer(
  async (query: string) => {
    const results = await api.search(query);
    return results;
  },
  { wait: 500 },
  (state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })
);

// Opt-in to track error state changes (optimized for error handling)
const debouncer = createAsyncDebouncer(
  async (searchTerm) => {
    const data = await searchAPI(searchTerm);
    return data;
  },
  {
    wait: 300,
    leading: true,   // Execute immediately on first call
    trailing: false, // Skip trailing edge updates
    onError: (error) => {
      console.error('API call failed:', error);
    }
  },
  (state) => ({ hasError: state.hasError, lastError: state.lastError })
);

// Access the selected state (will be empty object {} unless selector provided)
const { isPending, isExecuting } = debouncer.state();
```
