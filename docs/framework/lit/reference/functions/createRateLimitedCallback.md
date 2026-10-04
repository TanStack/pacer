---
id: createRateLimitedCallback
title: createRateLimitedCallback
---

```ts
function createRateLimitedCallback<TFn>(
   host,
   fn,
   options): (...args) => boolean;
```

Defined in: [rate-limiter/createRateLimitedCallback.ts:10](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimitedCallback.ts#L10)

Returns a stable ratelimited callback with the same options and cleanup as createRateLimiter.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### host

`ReactiveControllerHost`

### fn

`TFn`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`TFn`, \{
\}\>\>

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
