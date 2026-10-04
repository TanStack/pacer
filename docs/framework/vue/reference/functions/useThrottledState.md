---
id: useThrottledState
title: useThrottledState
---

```ts
function useThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, SetValue<TValue>, VueThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledState.ts:38](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottledState.ts#L38)

Creates throttled state with a scheduled setter.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueThrottlerOptions`](../interfaces/VueThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, `SetValue`\<`TValue`\>, [`VueThrottler`](../interfaces/VueThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useThrottledState } from '@tanstack/vue-pacer'

// During component setup:
const [count, setCount, utility] = useThrottledState(0, { wait: 500 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count.value for the committed value.
```

## See

useThrottler
