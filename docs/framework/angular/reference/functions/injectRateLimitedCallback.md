---
id: injectRateLimitedCallback
title: injectRateLimitedCallback
---

# Function: injectRateLimitedCallback()

```ts
function injectRateLimitedCallback<TFn>(fn, options): (...args) => boolean;
```

Defined in: [angular-pacer/src/rate-limiter/injectRateLimitedCallback.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedCallback.ts#L39)

An Angular function that creates a rate-limited version of a callback function.
This function is essentially a wrapper around `injectRateLimiter` that provides
a simplified API for basic rate limiting needs.

Rate limiting is a simple "hard limit" approach - it allows all calls until the limit
is reached, then blocks subsequent calls until the window resets. Unlike throttling
or debouncing, it does not attempt to space out or intelligently collapse calls.

This function provides a simpler API compared to `injectRateLimiter`, making it ideal for basic
rate limiting needs. However, it does not expose the underlying RateLimiter instance.

For advanced usage requiring features like:
- Manual cancellation/reset
- Access to execution counts
- State tracking

Consider using the `injectRateLimiter` function instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

`RateLimiterOptions`\<`TFn`\>

## Returns

```ts
(...args): boolean;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`boolean`

## Example

```ts
// Rate limit API calls to maximum 5 calls per minute
const makeApiCall = injectRateLimitedCallback(
  (data: ApiData) => {
    return fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
  },
  {
    limit: 5,
    window: 60000, // 1 minute
    windowType: 'sliding',
  }
);
```
