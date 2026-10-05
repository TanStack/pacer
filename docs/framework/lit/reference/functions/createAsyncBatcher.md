---
id: createAsyncBatcher
title: createAsyncBatcher
---

```ts
function createAsyncBatcher<TValue, TSelected>(
   host,
   fn,
   options?,
selector?): LitAsyncBatcher<TValue, TSelected>;
```

Defined in: [async-batcher/createAsyncBatcher.ts:99](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-batcher/createAsyncBatcher.ts#L99)

Creates and retains the AsyncBatcher for its Lit owner.

Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childHost, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `errorCount`: Number of batch executions that have resulted in errors
- `executionCount`: Number of batch executions that have been started
- `failedItems`: Array of items that failed during batch processing
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isExecuting`: Whether a batch is currently being processed asynchronously
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `lastResult`: The result from the most recent batch execution
- `settleCount`: Number of batch executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the batch queue
- `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout, 'executing' when processing, 'populated' when items are present, but no wait is configured
- `successCount`: Number of batch executions that have completed successfully
- `totalItemsFailed`: Total number of items that have failed processing across all batches
- `totalItemsProcessed`: Total number of items that have been processed across all batches

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Disconnecting the host calls cancel() and abort().
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

(`items`) => `Promise`\<`any`\>

Function executed by the utility.

### options?

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncBatcherOptions`](../interfaces/LitAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`LitAsyncBatcher`](../interfaces/LitAsyncBatcher.md)\<`TValue`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createAsyncBatcher } from '@tanstack/lit-pacer'

const utility = createAsyncBatcher(
  this, async (items: Array<string>) => { console.log(items) },
  { maxSize: 5, wait: 1000 },
  (state) => ({ size: state.size }),
)
utility.addItem('item')
// Selected state: utility.state.size
```
