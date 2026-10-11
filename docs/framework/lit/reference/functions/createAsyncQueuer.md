---
id: createAsyncQueuer
title: createAsyncQueuer
---

```ts
function createAsyncQueuer<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): LitAsyncQueuer<TValue, TSelected>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:104](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L104)

Creates and retains the AsyncQueuer for its Lit owner.

Retains items until they are processed. Use addItem to enqueue work and start, stop, execute, clear, or flush to control processing. Selected state exposes pending items, capacity, and completed work.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childHost, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `activeItems`: Items currently being processed by the queuer
- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `errorCount`: Number of task executions that have resulted in errors
- `executionCount`: Number of times execute has been called
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isExecuting`: Whether the queuer is currently executing
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `lastResult`: The result from the most recent task execution
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `settleCount`: Number of task executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the queue
- `status`: Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused
- `successCount`: Number of task executions that have completed successfully

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Disconnecting the host calls stop() and abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.
Reconnecting the host refreshes options and restores subscriptions to the same instance.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

Owner of option updates, subscriptions, and cleanup.

### fn

(`item`) => `Promise`\<`any`\>

Function executed by the utility.

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncQueuerOptions`](../interfaces/LitAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`LitAsyncQueuer`](../interfaces/LitAsyncQueuer.md)\<`TValue`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createAsyncQueuer } from '@tanstack/lit-pacer'

const utility = createAsyncQueuer(
  this, async (value: string) => { console.log(value) },
  { wait: 100 },
  (state) => ({ size: state.size }),
)
utility.addItem('item')
// Selected state: utility.state.size
```
