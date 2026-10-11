---
id: createRateLimitedSignal
title: createRateLimitedSignal
---

```ts
function createRateLimitedSignal<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimitedSignal.ts:41](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimitedSignal.ts#L41)

Creates rate-limited state with a scheduled setter.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns [value, setValue, utility]. The value is an accessor; call value() in the template. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteRateLimiterOptions`](../interfaces/SvelteRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`SvelteRateLimiter`](../interfaces/SvelteRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createRateLimitedSignal } from '@tanstack/svelte-pacer'

// During component initialization:
const [count, setCount, utility] = createRateLimitedSignal(0, { limit: 3, window: 1000 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count() for the committed value.
```

## See

createRateLimiter
