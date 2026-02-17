---
id: useAsyncThrottler
title: useAsyncThrottler
---

# Function: useAsyncThrottler()

```ts
function useAsyncThrottler<TFn, TSelected>(
   fn, 
   options, 
selector): ReactAsyncThrottler<TFn, TSelected>;
```

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:224](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L224)

A low-level React hook that creates an `AsyncThrottler` instance to limit how often an async function can execute.

This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).

Async throttling ensures an async function executes at most once within a specified time window,
regardless of how many times it is called. This is useful for rate-limiting expensive API calls,
database operations, or other async tasks.

Unlike the non-async Throttler, this async version supports returning values from the throttled function,
making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
instead of setting the result on a state variable from within the throttled function.

Error Handling:
- If an `onError` handler is provided, it will be called with the error and throttler instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncThrottler instance

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `throttler.Subscribe` HOC (Recommended for component tree subscriptions)**

Use the `Subscribe` HOC to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger a re-render
at the hook level, optimizing performance by preventing unnecessary re-renders when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` HOC. This prevents unnecessary
re-renders and gives you full control over when your component updates.

Available state properties:
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the throttled function is currently executing asynchronously
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `lastResult`: The result from the most recent successful function execution
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `settleCount`: Number of function executions that have completed (success or error)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Unmount behavior

By default, the hook cancels any pending execution when the component unmounts.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```tsx
const throttler = useAsyncThrottler(fn, {
  wait: 1000,
  onUnmount: (t) => t.flush()
});
```

Note: For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup.
If your throttled function updates React state, those updates may run after the component has
unmounted, which can cause "setState on unmounted component" warnings. Guard your callbacks
accordingly when using onUnmount with flush.

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

[`ReactAsyncThrottlerOptions`](../interfaces/ReactAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>

### selector

(`state`) => `TSelected`

## Returns

[`ReactAsyncThrottler`](../interfaces/ReactAsyncThrottler.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const asyncThrottler = useAsyncThrottler(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data; // Return value is preserved
  },
  { wait: 1000 }
);

// Subscribe to state changes deep in component tree using Subscribe HOC
<asyncThrottler.Subscribe selector={(state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })}>
  {({ isExecuting, isPending }) => (
    <div>{isExecuting || isPending ? 'Loading...' : 'Ready'}</div>
  )}
</asyncThrottler.Subscribe>

// Opt-in to re-render when execution state changes at hook level (optimized for loading indicators)
const asyncThrottler = useAsyncThrottler(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { wait: 1000 },
  (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
    status: state.status
  })
);

// Opt-in to re-render when results are available (optimized for data display)
const asyncThrottler = useAsyncThrottler(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { wait: 1000 },
  (state) => ({
    lastResult: state.lastResult,
    successCount: state.successCount,
    settleCount: state.settleCount
  })
);

// Opt-in to re-render when error state changes (optimized for error handling)
const asyncThrottler = useAsyncThrottler(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  {
    wait: 1000,
    onError: (error) => console.error('API call failed:', error)
  },
  (state) => ({
    errorCount: state.errorCount,
    status: state.status
  })
);

// Opt-in to re-render when timing information changes (optimized for timing displays)
const asyncThrottler = useAsyncThrottler(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { wait: 1000 },
  (state) => ({
    lastExecutionTime: state.lastExecutionTime,
    nextExecutionTime: state.nextExecutionTime
  })
);

// With state management and return value
const [data, setData] = useState(null);
const { maybeExecute, state } = useAsyncThrottler(
  async (query) => {
    const result = await searchAPI(query);
    setData(result);
    return result; // Return value can be used by the caller
  },
  {
    wait: 2000,
    leading: true,   // Execute immediately on first call
    trailing: false  // Skip trailing edge updates
  }
);

// Access the selected state (will be empty object {} unless selector provided)
const { isExecuting, lastResult } = state;
```
