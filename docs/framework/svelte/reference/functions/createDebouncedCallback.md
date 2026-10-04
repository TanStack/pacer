---
id: createDebouncedCallback
title: createDebouncedCallback
---

```ts
function createDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncedCallback.ts:33](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncedCallback.ts#L33)

Returns a stable debounced callback owned by the Svelte lifecycle.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use createDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): void;
```

Attempts to execute the debounced function
If a call is already in progress, it will be queued

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

## Example

```ts
import { createDebouncedCallback } from '@tanstack/svelte-pacer'

// During component initialization:
const schedule = createDebouncedCallback((value: number) => { console.log(value) }, { wait: 500 })
schedule(1)
```

## See

createDebouncer
