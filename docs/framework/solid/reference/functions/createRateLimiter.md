---
id: createRateLimiter
title: createRateLimiter
---

# Function: createRateLimiter()

```ts
function createRateLimiter<TFn, TSelected>(
   fn, 
   options, 
selector): SolidRateLimiter<TFn, TSelected>;
```

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:173](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L173)

A low-level Solid hook that creates a `RateLimiter` instance to enforce rate limits on function execution.

This hook is designed to be flexible and state-management agnostic - it simply returns a rate limiter instance that
you can integrate with any state management solution (createSignal, etc).

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

**1. Using `rateLimiter.Subscribe` component (Recommended for component tree subscriptions)**

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
- `executionCount`: Number of function executions that have been completed
- `rejectionCount`: Number of function calls that were rejected due to rate limiting
- `remainingInWindow`: Number of executions remaining in the current window
- `nextWindowTime`: Timestamp when the next window begins
- `currentWindowStart`: Timestamp when the current window started

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

`RateLimiterOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`SolidRateLimiter`](../interfaces/SolidRateLimiter.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const rateLimiter = createRateLimiter(apiCall, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
});

// Subscribe to state changes deep in component tree using Subscribe component
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {(state) => (
    <div>Rejections: {state().rejectionCount}</div>
  )}
</rateLimiter.Subscribe>

// Opt-in to track execution count changes at hook level (optimized for tracking successful executions)
const rateLimiter = createRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ executionCount: state.executionCount })
);

// Opt-in to track rejection count changes (optimized for tracking rate limit violations)
const rateLimiter = createRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ rejectionCount: state.rejectionCount })
);

// Opt-in to track execution times changes (optimized for window calculations)
const rateLimiter = createRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ executionTimes: state.executionTimes })
);

// Multiple state properties - track when any of these change
const rateLimiter = createRateLimiter(
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
const { executionCount, rejectionCount } = rateLimiter.state();
```
