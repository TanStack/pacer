---
id: useAsyncRateLimiter
title: useAsyncRateLimiter
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useAsyncRateLimiter()

```ts
function useAsyncRateLimiter<TFn, TSelected>(
   fn, 
   options, 
selector): ReactAsyncRateLimiter<TFn, TSelected>
```

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:178](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L178)

A low-level React hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.

This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).

Rate limiting allows an async function to execute up to a specified limit within a time window,
then blocks subsequent calls until the window passes. This is useful for respecting API rate limits,
managing resource constraints, or controlling bursts of async operations.

Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
instead of setting the result on a state variable from within the rate-limited function.

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

Error Handling:
- If an `onError` handler is provided, it will be called with the error and rate limiter instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncRateLimiter instance
- Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler

## State Management and Selector

The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
to specify which state changes will trigger a re-render, optimizing performance by preventing
unnecessary re-renders when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary re-renders and gives you
full control over when your component updates. Only when you provide a selector will the
component re-render when the selected state values change.

Available state properties:
- `errorCount`: Number of function executions that have resulted in errors
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExecuting`: Whether the rate-limited function is currently executing asynchronously
- `lastResult`: The result from the most recent successful function execution
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `settleCount`: Number of function executions that have completed (success or error)
- `successCount`: Number of function executions that have completed successfully

## Type Parameters

• **TFn** *extends* `AnyAsyncFunction`

• **TSelected** = \{\}

## Parameters

### fn

`TFn`

### options

`AsyncRateLimiterOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`ReactAsyncRateLimiter`](../../interfaces/reactasyncratelimiter.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data; // Return value is preserved
  },
  { limit: 5, window: 1000 } // 5 calls per second
);

// Opt-in to re-render when execution state changes (optimized for loading indicators)
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { limit: 5, window: 1000 },
  (state) => ({ isExecuting: state.isExecuting })
);

// Opt-in to re-render when results are available (optimized for data display)
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { limit: 5, window: 1000 },
  (state) => ({
    lastResult: state.lastResult,
    successCount: state.successCount
  })
);

// Opt-in to re-render when error/rejection state changes (optimized for error handling)
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  {
    limit: 5,
    window: 1000,
    onError: (error) => console.error('API call failed:', error),
    onReject: (rateLimiter) => console.log('Rate limit exceeded')
  },
  (state) => ({
    errorCount: state.errorCount,
    rejectionCount: state.rejectionCount
  })
);

// Opt-in to re-render when execution metrics change (optimized for stats display)
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { limit: 5, window: 1000 },
  (state) => ({
    successCount: state.successCount,
    errorCount: state.errorCount,
    settleCount: state.settleCount,
    rejectionCount: state.rejectionCount
  })
);

// Opt-in to re-render when execution times change (optimized for window calculations)
const asyncRateLimiter = useAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data;
  },
  { limit: 5, window: 1000 },
  (state) => ({ executionTimes: state.executionTimes })
);

// With state management and return value
const [data, setData] = useState(null);
const { maybeExecute, state } = useAsyncRateLimiter(
  async (query) => {
    const result = await searchAPI(query);
    setData(result);
    return result; // Return value can be used by the caller
  },
  {
    limit: 10,
    window: 60000, // 10 calls per minute
    onReject: (rateLimiter) => {
      console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
    },
    onError: (error) => {
      console.error('API call failed:', error);
    }
  }
);

// Access the selected state (will be empty object {} unless selector provided)
const { isExecuting, lastResult, rejectionCount } = state;
```
