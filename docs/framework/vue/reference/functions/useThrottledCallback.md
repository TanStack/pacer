---
id: useThrottledCallback
title: useThrottledCallback
---

```ts
function useThrottledCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [throttler/useThrottledCallback.ts:33](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottledCallback.ts#L33)

Returns a stable throttled callback owned by the Vue lifecycle.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use useThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueThrottlerOptions`](../interfaces/VueThrottlerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): void;
```

Attempts to execute the throttled function. The execution behavior depends on the throttler options:

- If enough time has passed since the last execution (>= wait period):
  - With leading=true: Executes immediately
  - With leading=false: Waits for the next trailing execution

- If within the wait period:
  - With trailing=true: Schedules execution for end of wait period
  - With trailing=false: Drops the execution

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

## Example

```ts
import { useThrottledCallback } from '@tanstack/vue-pacer'

// During component setup:
const schedule = useThrottledCallback((value: number) => { console.log(value) }, { wait: 500 })
schedule(1)
```

## See

useThrottler
