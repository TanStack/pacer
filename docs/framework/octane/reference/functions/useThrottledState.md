---
id: useThrottledState
title: useThrottledState
---

```ts
function useThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledState.ts:39](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottledState.ts#L39)

Creates throttled state with a scheduled setter.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns [value, setValue, utility]. Read the value during component rendering. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneThrottlerOptions`](../interfaces/OctaneThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, `SetValue`\<`TValue`\>, [`OctaneThrottler`](../interfaces/OctaneThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useThrottledState } from '@tanstack/octane-pacer'

// During component rendering:
const [count, setCount, utility] = useThrottledState(0, { wait: 500 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count for the committed value.
```

## See

useThrottler
