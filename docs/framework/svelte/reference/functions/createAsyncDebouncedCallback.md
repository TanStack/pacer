---
id: createAsyncDebouncedCallback
title: createAsyncDebouncedCallback
---

```ts
function createAsyncDebouncedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncedCallback.ts:36](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncedCallback.ts#L36)

Returns a stable debounced callback owned by the Svelte lifecycle.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.

## State and ownership

Use createAsyncDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteAsyncDebouncerOptions`](../interfaces/SvelteAsyncDebouncerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the debounced function.
If a call is already in progress, it will be queued.

Error Handling:
- If the debounced function throws and no `onError` handler is configured,
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

The error from the debounced function if no onError handler is configured

## Example

```ts
import { createAsyncDebouncedCallback } from '@tanstack/svelte-pacer'

// During component initialization:
const schedule = createAsyncDebouncedCallback(async (value: number) => { console.log(value) }, { wait: 500 })
void schedule(1)
```

## See

createAsyncDebouncer
