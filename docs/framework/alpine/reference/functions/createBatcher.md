---
id: createBatcher
title: createBatcher
---

```ts
function createBatcher<TValue, TSelected>(
   scope,
   fn,
   options?,
selector?): AlpineBatcher<TValue, TSelected>;
```

Defined in: [batcher/createBatcher.ts:83](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/batcher/createBatcher.ts#L83)

Creates and retains the Batcher for its Alpine owner.

Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childScope, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `executionCount`: Number of batch executions that have been completed
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `size`: Number of items currently in the batch queue
- `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout
- `totalItemsProcessed`: Total number of items that have been processed across all batches

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Destroying the owning scope calls cancel().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

Owner of option updates, subscriptions, and cleanup.

### fn

(`items`) => `void`

Function executed by the utility.

### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineBatcherOptions`](../interfaces/AlpineBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`AlpineBatcher`](../interfaces/AlpineBatcher.md)\<`TValue`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createBatcher } from '@tanstack/alpine-pacer'

const utility = createBatcher(
  scope, (items: Array<string>) => { console.log(items) },
  { maxSize: 5, wait: 1000 },
  (state) => ({ size: state.size }),
)
utility.addItem('item')
// Selected state: utility.state.size
```
