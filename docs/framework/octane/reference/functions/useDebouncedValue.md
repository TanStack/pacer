---
id: useDebouncedValue
title: useDebouncedValue
---

```ts
function useDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncedValue.ts#L37)

Derives a debounced value from its current source.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneDebouncerOptions`](../interfaces/OctaneDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneDebouncer`](../interfaces/OctaneDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { useDebouncedValue } from '@tanstack/octane-pacer'

// During component rendering:
// query is the current value from props or state.
const [value, utility] = useDebouncedValue(query, { wait: 500 })
// Bind value and use utility for controls. Read value for the committed value.
```

## See

useDebouncer
