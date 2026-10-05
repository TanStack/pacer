---
id: createThrottledValue
title: createThrottledValue
---

```ts
function createThrottledValue<TValue, TSelected>(
   scope,
   source,
   options,
   selector?): [CellValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/createThrottledValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottledValue.ts#L37)

Derives a throttled value from its current source.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns [value, utility]. The value is an accessor; call value() in Alpine bindings. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### source

`ValueSource`\<`TValue`\>

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createThrottledValue } from '@tanstack/alpine-pacer'

// scope belongs to the current Alpine component.
// source is an Alpine reactive object.
const [value, utility] = createThrottledValue(scope, () => source.query, { wait: 500 })
// Bind value and use utility for controls. Read value() for the committed value.
```

## See

createThrottler
