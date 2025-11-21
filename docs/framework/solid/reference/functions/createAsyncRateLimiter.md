---
id: createAsyncRateLimiter
title: createAsyncRateLimiter
---

# Function: createAsyncRateLimiter()

```ts
function createAsyncRateLimiter<TFn, TSelected>(
   fn, 
   initialOptions, 
selector): SolidAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:129](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L129)

A low-level Solid hook that creates an `AsyncRateLimiter` instance to limit how many times an async function can execute within a time window.

This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
you can integrate with any state management solution (createSignal, etc).

Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
all executions happen immediately, followed by a complete block.

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
instead of setting the result on a state variable from within the rate-limited function.

For smoother execution patterns, consider using:
- Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
- Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)

Rate limiting is best used for hard API limits or resource constraints. For UI updates or
smoothing out frequent events, throttling or debouncing usually provide better user experience.

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
- `currentWindowStart`: Timestamp when the current window started
- `executionCount`: Number of function executions that have been completed
- `hasError`: Whether the last execution resulted in an error
- `isExecuting`: Whether an async function execution is currently in progress
- `lastError`: The error from the most recent failed execution (if any)
- `lastResult`: The result from the most recent successful execution
- `nextWindowTime`: Timestamp when the next window begins
- `rejectionCount`: Number of function calls that were rejected due to rate limiting
- `remainingInWindow`: Number of executions remaining in the current window

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### initialOptions

`AsyncRateLimiterOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`SolidAsyncRateLimiter`](../../interfaces/SolidAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const { maybeExecute } = createAsyncRateLimiter(
  async (id: string) => {
    const data = await api.fetchData(id);
    return data; // Return value is preserved
  },
  { limit: 5, window: 1000 } // 5 calls per second
);

// Opt-in to re-render when rate limit and execution state changes (optimized for UI feedback)
const rateLimiter = createAsyncRateLimiter(
  async (query) => {
    const result = await searchAPI(query);
    return result;
  },
  { limit: 10, window: 60000 },
  (state) => ({
    remainingInWindow: state.remainingInWindow,
    isExecuting: state.isExecuting,
    rejectionCount: state.rejectionCount
  })
);

// Opt-in to re-render when error state changes (optimized for error handling)
const rateLimiter = createAsyncRateLimiter(
  async (query) => {
    const result = await searchAPI(query);
    return result;
  },
  {
    limit: 10,
    window: 60000, // 10 calls per minute
    onReject: (info) => console.log(`Rate limit exceeded: ${info.nextValidTime - Date.now()}ms until next window`)
  },
  (state) => ({ hasError: state.hasError, lastError: state.lastError })
);

// Access the selected state (will be empty object {} unless selector provided)
const { remainingInWindow, isExecuting } = rateLimiter.state();
```
