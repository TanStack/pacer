---
id: createQueuedValue
title: createQueuedValue
---

```ts
function createQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [CellValue<TValue>, SvelteQueuer<TValue, TSelected>];
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuedValue.ts:36](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuedValue.ts#L36)

Derives a queued value from its current source.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Returns [value, utility]. The value is an accessor; call value() in the template. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.

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

### options?

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteQueuerOptions`](../interfaces/SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteQueuer`](../interfaces/SvelteQueuer.md)\<`TValue`, `TSelected`\>\]

## Example

```ts
import { createQueuedValue } from '@tanstack/svelte-pacer'

// During component initialization:
let source = $state('')
const [value, utility] = createQueuedValue(() => source, { wait: 500 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createQueuer
