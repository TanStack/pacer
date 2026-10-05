---
id: createDebouncer
title: createDebouncer
---

```ts
function createDebouncer<TFn, TSelected>(
   fn,
   options,
selector?): SvelteDebouncer<TFn, TSelected>;
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncer.ts:82](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncer.ts#L82)

Creates and retains the Debouncer for its Svelte owner.

Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Read selected state through utility.state. Use utility.Subscribe with a children snippet
to select state in a child without updating the owner.

Available state fields:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting for timeout

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Destroying the component calls cancel().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

Function executed by the utility.

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`SvelteDebouncer`](../interfaces/SvelteDebouncer.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createDebouncer } from '@tanstack/svelte-pacer'

const utility = createDebouncer(
  (value: string) => { console.log(value) },
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
utility.maybeExecute('item')
// Selected state: utility.state.isPending
```
