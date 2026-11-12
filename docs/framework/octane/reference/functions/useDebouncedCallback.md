---
id: useDebouncedCallback
title: useDebouncedCallback
---

```ts
function useDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [debouncer/useDebouncedCallback.ts:34](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncedCallback.ts#L34)

Returns a stable debounced callback owned by the Octane lifecycle.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use useDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneDebouncerOptions`](../interfaces/OctaneDebouncerOptions.md)\<`TFn`, \{
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
import { useDebouncedCallback } from '@tanstack/octane-pacer'

// During component rendering:
const schedule = useDebouncedCallback((value: number) => { console.log(value) }, { wait: 500 })
schedule(1)
```

## See

useDebouncer
