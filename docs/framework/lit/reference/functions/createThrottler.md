---
id: createThrottler
title: createThrottler
---

```ts
function createThrottler<TFn, TSelected>(
   host,
   fn,
   options,
selector?): LitThrottler<TFn, TSelected>;
```

Defined in: [throttler/createThrottler.ts:87](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottler.ts#L87)

Creates and retains the Throttler for its Lit owner.

Limits execution to at most one call per wait interval. Leading and trailing options control immediate and deferred execution; the trailing call uses the latest arguments.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childHost, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting for timeout

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Disconnecting the host calls cancel().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.
Reconnecting the host refreshes options and restores subscriptions to the same instance.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

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

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitThrottlerOptions`](../interfaces/LitThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`LitThrottler`](../interfaces/LitThrottler.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createThrottler } from '@tanstack/lit-pacer'

const utility = createThrottler(
  this, (value: string) => { console.log(value) },
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
utility.maybeExecute('item')
// Selected state: utility.state.isPending
```
