---
id: createAsyncDebouncer
title: createAsyncDebouncer
---

```ts
function createAsyncDebouncer<TFn, TSelected>(
   host,
   fn,
   options,
selector?): LitAsyncDebouncer<TFn, TSelected>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:96](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L96)

Creates and retains the AsyncDebouncer for its Lit owner.

Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childHost, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
- `successCount`: Number of function executions that have completed successfully

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Disconnecting the host calls cancel() and abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.
Reconnecting the host refreshes options and restores subscriptions to the same instance.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

Owner of option updates, subscriptions, and cleanup.

### fn

`TFn`

Function executed by the utility.

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncDebouncerOptions`](../interfaces/LitAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`LitAsyncDebouncer`](../interfaces/LitAsyncDebouncer.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createAsyncDebouncer } from '@tanstack/lit-pacer'

const utility = createAsyncDebouncer(
  this, async (value: string) => { console.log(value) },
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
utility.maybeExecute('item')
// Selected state: utility.state.isPending
```
