---
id: useDebouncedState
title: useDebouncedState
---

```ts
function useDebouncedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, SetValue<TValue>, VueDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedState.ts:38](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncedState.ts#L38)

Creates debounced state with a scheduled setter.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns [value, setValue, utility]. The value is a readonly shallow ref; read value.value in JavaScript or bind the ref in a template. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### initialValue

`TValue`

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueDebouncerOptions`](../interfaces/VueDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, `SetValue`\<`TValue`\>, [`VueDebouncer`](../interfaces/VueDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useDebouncedState } from '@tanstack/vue-pacer'

// During component setup:
const [count, setCount, utility] = useDebouncedState(0, { wait: 500 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count.value for the committed value.
```

## See

useDebouncer
