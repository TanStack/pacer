---
id: createQueuer
title: createQueuer
---

```ts
function createQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): SvelteQueuer<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:85](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L85)

Creates and retains the Queuer for its Svelte owner.

Retains items until they are processed. Use addItem to enqueue work and start, stop, execute, clear, or flush to control processing. Selected state exposes pending items, capacity, and completed work.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Read selected state through utility.state. Use utility.Subscribe with a children snippet
to select state in a child without updating the owner.

Available state fields:

- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `executionCount`: Number of items that have been processed by the queuer
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `size`: Number of items currently in the queue
- `status`: Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Destroying the component calls stop().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

(`item`) => `void`

Function executed by the utility.

### options?

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteQueuerOptions`](../interfaces/SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`SvelteQueuer`](../interfaces/SvelteQueuer.md)\<`TValue`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createQueuer } from '@tanstack/svelte-pacer'

const utility = createQueuer(
  (value: string) => { console.log(value) },
  { wait: 100 },
  (state) => ({ size: state.size }),
)
utility.addItem('item')
// Selected state: utility.state.size
```
