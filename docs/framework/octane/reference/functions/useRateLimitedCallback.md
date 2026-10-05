---
id: useRateLimitedCallback
title: useRateLimitedCallback
---

```ts
function useRateLimitedCallback<TFn>(fn, options): (...args) => boolean;
```

Defined in: [rate-limiter/useRateLimitedCallback.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimitedCallback.ts#L37)

Returns a stable rate-limited callback owned by the Octane lifecycle.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns an accepted-or-rejected boolean.

## State and ownership

Use useRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneRateLimiterOptions`](../interfaces/OctaneRateLimiterOptions.md)\<`TFn`, \{
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

## Example

```ts
import { useRateLimitedCallback } from '@tanstack/octane-pacer'

// During component rendering:
const schedule = useRateLimitedCallback((value: number) => { console.log(value) }, { limit: 3, window: 1000 })
schedule(1)
```

## See

useRateLimiter
