---
id: createAsyncThrottledCallback
title: createAsyncThrottledCallback
---

```ts
function createAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/svelte-pacer/src/async-throttler/createAsyncThrottledCallback.ts:36](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-throttler/createAsyncThrottledCallback.ts#L36)

Returns a stable throttled callback owned by the Svelte lifecycle.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.

## State and ownership

Use createAsyncThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncThrottlerOptions`](../interfaces/SvelteAsyncThrottlerOptions.md)\<`TFn`, \{
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
import { createAsyncThrottledCallback } from '@tanstack/svelte-pacer'

// During component initialization:
const schedule = createAsyncThrottledCallback(async (value: number) => { console.log(value) }, { wait: 500 })
void schedule(1)
```

## See

createAsyncThrottler
