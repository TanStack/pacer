---
id: createRateLimitedValue
title: createRateLimitedValue
---

```ts
function createRateLimitedValue<TValue, TSelected>(
   host,
   source,
   options,
   selector?): [CellValue<TValue>, LitRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/createRateLimitedValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimitedValue.ts#L37)

Derives a rate-limited value from its current source.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns [value, utility]. The value is an accessor; call value() from render(). Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

### source

`ValueSource`\<`TValue`\>

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitRateLimiter`](../interfaces/LitRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createRateLimitedValue } from '@tanstack/lit-pacer'

// In a LitElement constructor:
// query is a reactive property on this host.
const [value, utility] = createRateLimitedValue(this, () => this.query, { limit: 3, window: 1000 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createRateLimiter
