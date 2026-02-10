---
id: injectAsyncRateLimitedCallback
title: injectAsyncRateLimitedCallback
---

# Function: injectAsyncRateLimitedCallback()

```ts
function injectAsyncRateLimitedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimitedCallback.ts:43](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimitedCallback.ts#L43)

An Angular function that creates an async rate-limited version of a callback function.
This function is essentially a wrapper around `injectAsyncRateLimiter` that provides
a simplified API for basic async rate limiting needs.

This function provides a simpler API compared to `injectAsyncRateLimiter`, making it ideal for basic
async rate limiting needs. However, it does not expose the underlying AsyncRateLimiter instance.

For advanced usage requiring features like:
- Manual cancellation/reset
- Access to execution counts
- Error handling callbacks
- Retry support

Consider using the `injectAsyncRateLimiter` function instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

`AsyncRateLimiterOptions`\<`TFn`\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

## Example

```ts
// Rate limit API calls
const makeApiCall = injectAsyncRateLimitedCallback(
  async (data: ApiData) => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
  }
);

// Use in event handler
const result = await makeApiCall(apiData);
```
