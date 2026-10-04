---
id: useThrottledValue
title: useThrottledValue
---

```ts
function useThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottledValue.ts#L37)

Derives a throttled value from its current source.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns [value, utility]. Read the value during component rendering. Pass the current render value. The initial value is available immediately. Source changes schedule updates on the existing utility.

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

### source

`TValue`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneThrottlerOptions`](../interfaces/OctaneThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneThrottler`](../interfaces/OctaneThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useThrottledValue } from '@tanstack/octane-pacer'

// During component rendering:
// query is the current value from props or state.
const [value, utility] = useThrottledValue(query, { wait: 500 })
// Bind value and use utility for controls. Read value for the committed value.
```

## See

useThrottler
