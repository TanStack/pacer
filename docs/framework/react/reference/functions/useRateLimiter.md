---
id: useRateLimiter
title: useRateLimiter
---

# Function: useRateLimiter()

```ts
function useRateLimiter<TFn, TSelected>(
   fn, 
   options, 
selector): ReactRateLimiter<TFn, TSelected>;
```

Defined in: [react-pacer/src/rate-limiter/useRateLimiter.ts:190](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimiter.ts#L190)

A low-level React hook that creates a `RateLimiter` instance to enforce rate limits on function execution.

This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc).

Rate limiting is a simple "hard limit" approach that allows executions until a maximum count is reached within
a time window, then blocks all subsequent calls until the window resets. Unlike throttling or debouncing,
it does not attempt to space out or collapse executions intelligently.

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

For smoother execution patterns:
- Use throttling when you want consistent spacing between executions (e.g. UI updates)
- Use debouncing when you want to collapse rapid-fire events (e.g. search input)
- Use rate limiting only when you need to enforce hard limits (e.g. API rate limits)

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `rateLimiter.Subscribe` HOC (Recommended for component tree subscriptions)**

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
- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting

The hook returns an object containing:
- maybeExecute: The rate-limited function that respects the configured limits
- getExecutionCount: Returns the number of successful executions
- getRejectionCount: Returns the number of rejected executions due to rate limiting
- getRemainingInWindow: Returns how many more executions are allowed in the current window
- reset: Resets the execution counts and window timing

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### options

[`ReactRateLimiterOptions`](../interfaces/ReactRateLimiterOptions.md)\<`TFn`, `TSelected`\>

### selector

(`state`) => `TSelected`

## Returns

[`ReactRateLimiter`](../interfaces/ReactRateLimiter.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const rateLimiter = useRateLimiter(apiCall, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
});

// Subscribe to state changes deep in component tree using Subscribe HOC
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {({ rejectionCount }) => (
    <div>Rejected: {rejectionCount} requests</div>
  )}
</rateLimiter.Subscribe>

// Opt-in to re-render when execution count changes at hook level (optimized for tracking successful executions)
const rateLimiter = useRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ executionCount: state.executionCount })
);

// Opt-in to re-render when rejection count changes (optimized for tracking rate limit violations)
const rateLimiter = useRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ rejectionCount: state.rejectionCount })
);

// Opt-in to re-render when execution times change (optimized for window calculations)
const rateLimiter = useRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ executionTimes: state.executionTimes })
);

// Multiple state properties - re-render when any of these change
const rateLimiter = useRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount
  })
);

// Monitor rate limit status
const handleClick = () => {
  const remaining = rateLimiter.getRemainingInWindow();
  if (remaining > 0) {
    rateLimiter.maybeExecute(data);
  } else {
    showRateLimitWarning();
  }
};

// Access the selected state (will be empty object {} unless selector provided)
const { executionCount, rejectionCount } = rateLimiter.state;
```
