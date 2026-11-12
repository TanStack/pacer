---
id: createQueuedValue
title: createQueuedValue
---

```ts
function createQueuedValue<TValue, TSelected>(
   host,
   source,
   options?,
   selector?): [CellValue<TValue>, LitQueuer<TValue, TSelected>];
```

Defined in: [queuer/createQueuedValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuedValue.ts#L37)

Derives a queued value from its current source.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [value, utility]. The value is an accessor; call value() from render(). Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.

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

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitQueuerOptions`](../interfaces/LitQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitQueuer`](../interfaces/LitQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createQueuedValue } from '@tanstack/lit-pacer'

// In a LitElement constructor:
// query is a reactive property on this host.
const [value, utility] = createQueuedValue(this, () => this.query, { wait: 500 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createQueuer
