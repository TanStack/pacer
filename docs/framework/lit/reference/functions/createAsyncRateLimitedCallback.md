---
id: createAsyncRateLimitedCallback
title: createAsyncRateLimitedCallback
---

```ts
function createAsyncRateLimitedCallback<TFn>(
   host,
   fn,
options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-rate-limiter/createAsyncRateLimitedCallback.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimitedCallback.ts#L13)

Returns a stable ratelimited callback with the same options and cleanup as createAsyncRateLimiter.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### host

`ReactiveControllerHost`

### fn

`TFn`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncRateLimiterOptions`](../interfaces/LitAsyncRateLimiterOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

Error Handling:
- If the rate-limited function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

### Throws

The error from the rate-limited function if no onError handler is configured

### Example

```ts
const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return a promise that resolves with the result
const result = await rateLimiter.maybeExecute('arg1', 'arg2');

// Additional calls within the window will return undefined
const result2 = await rateLimiter.maybeExecute('arg1', 'arg2'); // undefined
```
