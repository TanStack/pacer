---
id: createDebouncedState
title: createDebouncedState
---

```ts
function createDebouncedState<TValue, TSelected>(
   host,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, LitDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/createDebouncedState.ts:39](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncedState.ts#L39)

Creates debounced state with a scheduled setter.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns [value, setValue, utility]. The value is an accessor; call value() from render(). Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.

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

### initialValue

`TValue`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitDebouncerOptions`](../interfaces/LitDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`LitDebouncer`](../interfaces/LitDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createDebouncedState } from '@tanstack/lit-pacer'

// In a LitElement constructor:
const [count, setCount, utility] = createDebouncedState(this, 0, { wait: 500 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count() for the committed value.
```

## See

createDebouncer
