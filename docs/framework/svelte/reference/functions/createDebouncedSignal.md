---
id: createDebouncedSignal
title: createDebouncedSignal
---

```ts
function createDebouncedSignal<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, SvelteDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncedSignal.ts:38](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncedSignal.ts#L38)

Creates debounced state with a scheduled setter.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`SvelteDebouncer`](../interfaces/SvelteDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
import { createDebouncedSignal } from '@tanstack/svelte-pacer'

// During component initialization:
const [count, setCount, utility] = createDebouncedSignal(0, { wait: 500 },
  (state) => ({ executionCount: state.executionCount }),
)
setCount((previous) => previous + 1)
// Bind count and utility.state in the component. Read count() for the committed value.
```

## See

createDebouncer
