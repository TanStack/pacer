---
title: Vanilla Batching Guide
id: batching
---

Batching collects items and passes them to one function as an array. A batch can run when it reaches a configured size, after no new items arrive for a configured wait, or when custom logic says it is ready.

Batching reduces the number of operations by processing several items together. Unlike queuing, it does not call the wrapped function once for each item.

## How batching works

```text
Batching (process every 3 items or after 2 quiet ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️             ⬇️  ⬇️  ⬇️
Batch:       [ABC]   []      [DE]      []        [FGH]  []
Executed:     ✅              ✅                  ✅
             [======================================================]
             ^ Items are grouped and processed together

             [Size reached]   [Wait elapsed]      [Size reached]
```

Each execution receives a copy of the items currently collected. The batcher clears those items before calling the wrapped function.

## When to use batching

Choose batching when:

- A bulk operation is more efficient than individual operations.
- Network requests, database writes, or analytics events can be grouped.
- A maximum batch size or quiet-period trigger matches the workload.
- Individual item results are unnecessary.

Choose another utility when:

- Every item should run individually and in order. Use [queuing](./queuing.md).
- Only the latest value matters. Use [debouncing](./debouncing.md).
- Calls should be spaced over time. Use [throttling](./throttling.md).
- Batch processing returns a Promise or needs retries and abort support. Use [async batching](./async-batching.md).

## Using batching in TanStack Pacer

TanStack Pacer provides two core APIs:

- `batch` returns a function that adds one item to a batch.
- `Batcher` exposes lifecycle methods, custom triggers, callbacks, and state.

### Convenience function

```ts
import { batch } from '@tanstack/pacer'

const sendEvents = batch<string>(
  (events) => {
    analytics.send(events)
  },
  {
    maxSize: 3,
    wait: 2000,
  },
)

sendEvents('opened-page')
sendEvents('clicked-button')
sendEvents('submitted-form') // Executes a batch of three items.
```

The returned function exposes no lifecycle methods and returns `void`.

### Class API

```ts
import { Batcher } from '@tanstack/pacer'

const eventBatcher = new Batcher<string>(
  (events) => {
    analytics.send(events)
  },
  {
    maxSize: 5,
    wait: 2000,
  },
)

eventBatcher.addItem('opened-page')
eventBatcher.addItem('clicked-button')

console.log(eventBatcher.peekAllItems())
```

### Results and errors

The synchronous batcher does not retain the wrapped function's return value or catch errors. It clears the current batch before invoking the function. If the function throws, those items are no longer queued.

Use [async batching](./async-batching.md) for Promise results, failed-item tracking, configurable error handling, retries, and abort support.

## Choosing batch triggers

### Batch size

`maxSize` executes the batch as soon as the number of collected items reaches the limit.

```ts
const batcher = new Batcher(processBatch, {
  maxSize: 100,
})
```

The default is `Infinity`, so a size trigger is disabled unless you provide one.

### Wait time

`wait` executes a batch after no new items arrive for the configured duration. Every added item restarts the timer.

```ts
const batcher = new Batcher(processBatch, {
  wait: 1000,
})
```

The default is `Infinity`, so a time trigger is disabled unless you provide one. A continuous stream of items can keep restarting the timer. Combine `wait` with `maxSize` when a batch must eventually run under continuous traffic.

### Custom trigger

`getShouldExecute` runs after each item is added. Return `true` to execute the current batch immediately.

```ts
const batcher = new Batcher<number>(processBatch, {
  getShouldExecute: (items) => items.includes(0),
})

batcher.addItem(4)
batcher.addItem(0) // Executes [4, 0].
```

If several triggers are configured, the first one reached executes the batch.

## Controlling collected items

### Flush

`flush()` clears the pending timer and executes all currently collected items. It does nothing when the batch is empty.

```ts
batcher.addItem('event-1')
batcher.addItem('event-2')
batcher.flush()
```

### Cancel

`cancel()` clears the pending timer but keeps the collected items. A later item can schedule a new timer, or you can call `flush()`.

```ts
batcher.cancel()
console.log(batcher.peekAllItems()) // Items are still present.
```

### Clear

`clear()` removes all collected items. It does not clear the timer itself, although that timer has no items to execute unless more items are added.

```ts
batcher.clear()
```

### Reset

`reset()` restores batch state and counters to their defaults. It does not cancel an already scheduled timer. Call `cancel()` before `reset()` when pending work must be discarded.

```ts
batcher.cancel()
batcher.reset()
```

## Configuring and observing batches

Use `setOptions()` to update future trigger behavior:

```ts
batcher.setOptions({
  maxSize: 20,
  wait: 500,
})
```

Changing `wait` does not reschedule an existing timer. The next `addItem()` call replaces that timer using the current value.

The `wait` option may be a function that receives the batcher instance:

```ts
const batcher = new Batcher(processBatch, {
  wait: (batcher) => (batcher.store.state.size > 10 ? 100 : 500),
})
```

Use `onItemsChange` to observe collection changes and `onExecute` to observe completed batch calls:

```ts
const batcher = new Batcher(processBatch, {
  maxSize: 10,
  onItemsChange: (batcher) => {
    console.log('Collected:', batcher.store.state.size)
  },
  onExecute: (items, batcher) => {
    console.log('Processed:', items)
    console.log('Batches:', batcher.store.state.executionCount)
  },
})
```

Do not use `started` to pause a batcher. It is currently a no-op, so every `addItem()` call evaluates the configured triggers.

## State

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items`: Items currently collected.
- `size`: Number of collected items.
- `isEmpty`: Whether the batch is empty.
- `isPending`: Whether a wait timer is active.
- `executionCount`: Completed batch executions.
- `totalItemsProcessed`: Items passed to completed batch executions.
- `status`: `'idle'` or `'pending'`.

See the [`Batcher` API reference](../../../reference/classes/Batcher.md) for complete option and state types.
