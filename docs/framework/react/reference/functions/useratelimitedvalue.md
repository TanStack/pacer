---
id: useRateLimitedValue
title: useRateLimitedValue
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useRateLimitedValue()

```ts
function useRateLimitedValue<TValue>(value, options): [TValue, RateLimiter<Dispatch<SetStateAction<TValue>>>]
```

Defined in: [react-pacer/src/rate-limiter/useRateLimitedValue.ts:55](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimitedValue.ts#L55)

A high-level React hook that creates a rate-limited version of a value that updates at most a certain number of times within a time window.
This hook uses React's useState internally to manage the rate-limited state.

Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
or intelligently collapse updates. This can lead to bursts of rapid updates followed by periods of no updates.

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All updates within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows updates as old ones expire. This provides a more
  consistent rate of updates over time.

For smoother update patterns, consider:
- useThrottledValue: When you want consistent spacing between updates (e.g. UI changes)
- useDebouncedValue: When you want to collapse rapid updates into a single update (e.g. search input)

Rate limiting should primarily be used when you need to enforce strict limits, like API rate limits.

The hook returns a tuple containing:
- The rate-limited value that updates according to the configured rate limit
- The rate limiter instance with control methods

For more direct control over rate limiting behavior without React state management,
consider using the lower-level useRateLimiter hook instead.

## Type Parameters

• **TValue**

## Parameters

### value

`TValue`

### options

`RateLimiterOptions`\<`Dispatch`\<`SetStateAction`\<`TValue`\>\>\>

## Returns

\[`TValue`, `RateLimiter`\<`Dispatch`\<`SetStateAction`\<`TValue`\>\>\>\]

## Example

```tsx
// Basic rate limiting - update at most 5 times per minute with a sliding window
const [rateLimitedValue, rateLimiter] = useRateLimitedValue(rawValue, {
  limit: 5,
  window: 60000,
  windowType: 'sliding'
});

// With rejection callback and fixed window
const [rateLimitedValue, rateLimiter] = useRateLimitedValue(rawValue, {
  limit: 3,
  window: 5000,
  windowType: 'fixed',
  onReject: (rateLimiter) => {
    console.log(`Update rejected. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
  }
});
```
