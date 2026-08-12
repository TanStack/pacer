---
title: Angular Batching Guide
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

## Choose an API

- `injectBatchedCallback` for an item-adder
- `injectBatcher` for flush, cancel, collected items, and selected state

Use the callback API when adding items is all the component needs. Use the instance API for `flush()`, `cancel()`, collected items, selected state, and dynamic options.

## Angular example

```ts
import { injectBatchedCallback, injectBatcher } from '@tanstack/angular-pacer'

export class AnalyticsComponent {
  readonly addEvent = injectBatchedCallback(sendEvents, {
    maxSize: 20,
    wait: 1000,
  })
  readonly batcher = injectBatcher(
    sendEvents,
    { maxSize: 20, wait: 1000 },
    (state) => ({
      size: state.size,
    }),
  )
}
```

The focused snippets later in this guide use `injectBatcher` and assume they run inside an Angular injection context.

## Choosing batch triggers

### Batch size

`maxSize` executes the batch as soon as the number of collected items reaches the limit.

```ts
const batcher = injectBatcher(processBatch, {
  maxSize: 100,
})
```

The default is `Infinity`, so a size trigger is disabled unless you provide one.

### Wait time

`wait` executes a batch after no new items arrive for the configured duration. Every added item restarts the timer.

```ts
const batcher = injectBatcher(processBatch, {
  wait: 1000,
})
```

The default is `Infinity`, so a time trigger is disabled unless you provide one. A continuous stream of items can keep restarting the timer. Combine `wait` with `maxSize` when a batch must eventually run under continuous traffic.

### Custom trigger

`getShouldExecute` runs after each item is added. Return `true` to execute the current batch immediately.

```ts
const batcher = injectBatcher<number>(processBatch, {
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
const batcher = injectBatcher(processBatch, {
  wait: (batcher) => (batcher.store.state.size > 10 ? 100 : 500),
})
```

Use `onItemsChange` to observe collection changes and `onExecute` to observe completed batch calls:

```ts
const batcher = injectBatcher(processBatch, {
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

## Angular lifecycle

The adapter cancels the pending wait timer while retaining collected items when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility in an Angular injection context, usually as a component or service field initializer and select only fields used by the view:

```ts
const batcher = injectBatcher(
  processBatch,
  { maxSize: 20, wait: 1000 },
  (state) => ({
    size: state.size,
    isPending: state.isPending,
  }),
)

console.log(batcher.state().size, batcher.state().isPending)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items`: Items currently collected.
- `size`: Number of collected items.
- `isEmpty`: Whether the batch is empty.
- `isPending`: Whether a wait timer is active.
- `executionCount`: Completed batch executions.
- `totalItemsProcessed`: Items passed to completed batch executions.
- `status`: `'idle'` or `'pending'`.

See the [Angular API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
