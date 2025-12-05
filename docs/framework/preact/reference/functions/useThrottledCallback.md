---
id: useThrottledCallback
title: useThrottledCallback
---

# Function: useThrottledCallback()

```ts
function useThrottledCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [preact-pacer/src/throttler/useThrottledCallback.ts:43](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottledCallback.ts#L43)

A Preact hook that creates a throttled version of a callback function.
This hook is essentially a wrapper around the basic `throttle` function
that is exported from `@tanstack/pacer`,
but optimized for Preact with reactive options and a stable function reference.

The throttled function will execute at most once within the specified wait time period,
regardless of how many times it is called. If called multiple times during the wait period,
only the first invocation will execute, and subsequent calls will be ignored until
the wait period has elapsed.

This hook provides a simpler API compared to `useThrottler`, making it ideal for basic
throttling needs. However, it does not expose the underlying Throttler instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution counts
- Custom useCallback dependencies

Consider using the `useThrottler` hook instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

`ThrottlerOptions`\<`TFn`\>

## Returns

```ts
(...args): void;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

## Example

```tsx
// Throttle a window resize handler
const handleResize = useThrottledCallback(() => {
  updateLayoutMeasurements();
}, {
  wait: 100 // Execute at most once every 100ms
});

// Use in an event listener
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```
