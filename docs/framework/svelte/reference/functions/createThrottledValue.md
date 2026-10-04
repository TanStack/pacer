---
id: createThrottledValue
title: createThrottledValue
---

```ts
function createThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, SvelteThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/throttler/createThrottledValue.ts:36](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottledValue.ts#L36)

Derives a throttled value from its current source.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteThrottlerOptions`](../interfaces/SvelteThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteThrottler`](../interfaces/SvelteThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createThrottledValue } from '@tanstack/svelte-pacer'

// During component initialization:
let source = $state('')
const [value, utility] = createThrottledValue(() => source, { wait: 500 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createThrottler
