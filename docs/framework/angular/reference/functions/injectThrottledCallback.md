---
id: injectThrottledCallback
title: injectThrottledCallback
---

# Function: injectThrottledCallback()

```ts
function injectThrottledCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [throttler/injectThrottledCallback.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottledCallback.ts#L39)

An Angular function that creates a throttled version of a callback function.
This function is essentially a wrapper around `injectThrottler` that provides
a simplified API for basic throttling needs.

The throttled function will execute at most once within the specified wait time.
If called multiple times within the wait period, only the first call (if leading is enabled)
or the last call (if trailing is enabled) will execute.

This function provides a simpler API compared to `injectThrottler`, making it ideal for basic
throttling needs. However, it does not expose the underlying Throttler instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution counts
- State tracking

Consider using the `injectThrottler` function instead.

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

```ts
// Throttle a scroll handler
const handleScroll = injectThrottledCallback((scrollY: number) => {
  updateScrollPosition(scrollY);
}, {
  wait: 100 // Execute at most once per 100ms
});

// Use in an event listener
window.addEventListener('scroll', () => {
  handleScroll(window.scrollY);
});
```
