---
id: useRateLimitedValue
title: useRateLimitedValue
---

```ts
function useRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedValue.ts:40](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimitedValue.ts#L40)

Derives a rate-limited value from its current source.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneRateLimiterOptions`](../interfaces/OctaneRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneRateLimiter`](../interfaces/OctaneRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useRateLimitedValue } from '@tanstack/octane-pacer'

// During component rendering:
// query is the current value from props or state.
const [value, utility] = useRateLimitedValue(query, { limit: 3, window: 1000 })
// Bind value and use utility for controls. Read value for the committed value.
```

## See

useRateLimiter
