---
id: injectRateLimiter
title: injectRateLimiter
---

# Function: injectRateLimiter()

```ts
function injectRateLimiter<TFn, TSelected>(
   fn, 
   options, 
selector): AngularRateLimiter<TFn, TSelected>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:114](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L114)

An Angular function that creates and manages a RateLimiter instance.

This is a lower-level function that provides direct access to the RateLimiter's functionality.
This allows you to integrate it with any state management solution you prefer.

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

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

Available state properties:
- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting

## Cleanup on Destroy

Use the `onUnmount` option to run a callback when the component is destroyed.

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

[`AngularRateLimiterOptions`](../interfaces/AngularRateLimiterOptions.md)\<`TFn`, `TSelected`\>

### selector

(`state`) => `TSelected`

## Returns

[`AngularRateLimiter`](../interfaces/AngularRateLimiter.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const rateLimiter = injectRateLimiter(apiCall, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
});

// Opt-in to track execution count changes
const rateLimiter = injectRateLimiter(
  apiCall,
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  },
  (state) => ({ executionCount: state.executionCount })
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
