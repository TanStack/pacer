---
id: createRateLimitedValue
title: createRateLimitedValue
---

```ts
function createRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimitedValue.ts:39](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimitedValue.ts#L39)

Derives a rate-limited value from its current source.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns [value, utility]. The value is an accessor; call value() in the template. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.

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

### source

`ValueSource`\<`TValue`\>

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteRateLimiterOptions`](../interfaces/SvelteRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteRateLimiter`](../interfaces/SvelteRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createRateLimitedValue } from '@tanstack/svelte-pacer'

// During component initialization:
let source = $state('')
const [value, utility] = createRateLimitedValue(() => source, { limit: 3, window: 1000 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createRateLimiter
