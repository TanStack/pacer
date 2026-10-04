---
id: useAsyncRateLimitedCallback
title: useAsyncRateLimitedCallback
---

```ts
function useAsyncRateLimitedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-rate-limiter/useAsyncRateLimitedCallback.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimitedCallback.ts#L37)

Returns a stable rate-limited callback owned by the Octane lifecycle.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A rejected rate-limit call resolves with undefined.

## State and ownership

Use useAsyncRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncRateLimiterOptions`](../interfaces/OctaneAsyncRateLimiterOptions.md)\<`TFn`, \{
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

## Example

```ts
import { useAsyncRateLimitedCallback } from '@tanstack/octane-pacer'

// During component rendering:
const schedule = useAsyncRateLimitedCallback(async (value: number) => { console.log(value) }, { limit: 3, window: 1000 })
void schedule(1)
```

## See

useAsyncRateLimiter
