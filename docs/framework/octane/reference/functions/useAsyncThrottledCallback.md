---
id: useAsyncThrottledCallback
title: useAsyncThrottledCallback
---

```ts
function useAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-throttler/useAsyncThrottledCallback.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottledCallback.ts#L37)

Returns a stable throttled callback owned by the Octane lifecycle.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.

## State and ownership

Use useAsyncThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncThrottlerOptions`](../interfaces/OctaneAsyncThrottlerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
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

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

### Example

```ts
const throttled = new AsyncThrottler(fn, { wait: 1000 });

// First call executes immediately
await throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
await throttled.maybeExecute('c', 'd');
```

## Example

```ts
import { useAsyncThrottledCallback } from '@tanstack/octane-pacer'

// During component rendering:
const schedule = useAsyncThrottledCallback(async (value: number) => { console.log(value) }, { wait: 500 })
void schedule(1)
```

## See

useAsyncThrottler
