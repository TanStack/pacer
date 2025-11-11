---
id: rateLimit
title: rateLimit
---

# Function: rateLimit()

```ts
function rateLimit<TFn>(fn, initialOptions): (...args) => boolean;
```

Defined in: [rate-limiter.ts:424](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L424)

Creates a rate-limited function that will execute the provided function up to a maximum number of times within a time window.

This synchronous version is lighter weight and often all you need - upgrade to asyncRateLimit when you need promises, retry support, abort capabilities, or advanced error handling.

Note that rate limiting is a simpler form of execution control compared to throttling or debouncing:
- A rate limiter will allow all executions until the limit is reached, then block all subsequent calls until the window resets
- A throttler ensures even spacing between executions, which can be better for consistent performance
- A debouncer collapses multiple calls into one, which is better for handling bursts of events

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the rate limiter
- Use `onExecute` callback to react to function execution and implement custom logic
- Use `onReject` callback to react to executions being rejected when rate limit is exceeded
- The state includes execution count, execution times, and rejection count
- State can be accessed via the underlying RateLimiter instance's `store.state` property
- When using framework adapters (React/Solid), state is accessed from the hook's state property

Consider using throttle() or debounce() if you need more intelligent execution control. Use rate limiting when you specifically
need to enforce a hard limit on the number of executions within a time period.

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../../type-aliases/AnyFunction.md)

## Parameters

### fn

`TFn`

### initialOptions

[`RateLimiterOptions`](../../interfaces/RateLimiterOptions.md)\<`TFn`\>

## Returns

```ts
(...args): boolean;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`boolean`

### Example

```ts
const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return true
rateLimiter.maybeExecute('arg1', 'arg2'); // true

// Additional calls within the window will return false
rateLimiter.maybeExecute('arg1', 'arg2'); // false
```

## Example

```ts
// Rate limit to 5 calls per minute with a sliding window
const rateLimited = rateLimit(makeApiCall, {
  limit: 5,
  window: 60000,
  windowType: 'sliding',
  onReject: (rateLimiter) => {
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
  }
});

// First 5 calls will execute immediately
// Additional calls will be rejected until the minute window resets
rateLimited();

// For more even execution, consider using throttle instead:
const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
```
