---
id: useRateLimitedState
title: useRateLimitedState
---

```ts
function useRateLimitedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [TValue, SetValue<TValue>, OctaneRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedState.ts:42](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimitedState.ts#L42)

Creates rate-limited state with a scheduled setter.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneRateLimiterOptions`](../interfaces/OctaneRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, `SetValue`\<`TValue`\>, [`OctaneRateLimiter`](../interfaces/OctaneRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useRateLimitedState } from '@tanstack/octane-pacer'

// During component rendering:
const [count, setCount, utility] = useRateLimitedState(0, { limit: 3, window: 1000 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count for the committed value.
```

## See

useRateLimiter
