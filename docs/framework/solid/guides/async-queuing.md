---
title: Solid Async Queuing Guide
id: async-queuing
---

Async queuing keeps the ordering, capacity, priority, expiration, and start or stop controls described in the [Queuing Guide](./queuing.md). It adds controlled concurrency, Promise-aware processing, per-item retries, result callbacks, and control over active work.

Use it when every accepted item should eventually run, but only a limited number of async operations should be active at once. Use [Async Rate Limiting](./async-rate-limiting.md) when excess calls should be rejected by a time window instead of waiting.

## How async queuing works

Items move through two stages:

```text
pending queue                 active work, concurrency: 2

[ A, B, C, D ]    start A    [ A ]
[ B, C, D ]       start B    [ A, B ]
[ B, C, D ]    B finishes    [ A ]
[ C, D ]          wait, C    [ A, C ]
```

`concurrency` limits automatically scheduled active items. Its default is `1`. With `wait: 0`, a free slot is filled after an item settles. With a positive `wait`, the queue waits that long after a settled item before checking for more work.

The queue controls start order. With concurrency greater than `1`, completion order depends on the work itself.

## Choose an API

- `createAsyncQueuer` for concurrency, ordering, lifecycle methods, and selected state

## Solid example

```tsx
import { createAsyncQueuer } from '@tanstack/solid-pacer'

const queue = createAsyncQueuer(uploadFile, { concurrency: 2 }, (state) => ({
  items: state.items,
  activeItems: state.activeItems,
}))

queue.addItem(nextFile())
console.log(queue.state().items.length, queue.state().activeItems.length)
```

The focused snippets later in this guide use `createAsyncQueuer` and assume they run inside a Solid reactive owner.

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

## Ordering pending items

The synchronous ordering rules still apply:

- The default adds at the back and reads from the front, producing FIFO order.
- Set `getItemsFrom: 'back'` for LIFO order.
- Set `addItemsTo` or pass a position to `addItem()` to control insertion.
- Set `getPriority(item)` to order higher numeric priorities first.

Priority ordering takes precedence over front or back removal.

```ts
const queue = createAsyncQueuer(processJob, {
  started: false,
  concurrency: 2,
  getPriority: (job) => job.priority,
})

queue.addItem({ id: 'low', priority: 1 })
queue.addItem({ id: 'high', priority: 10 })
queue.addItem({ id: 'medium', priority: 5 })
queue.start()
```

The high and medium jobs start first. Their relative completion order is not guaranteed.

## Capacity and rejection

`maxSize` limits pending items, not active items. Once an item starts, it leaves the pending queue and frees one pending slot. `addItem()` returns `false` and calls `onReject` when the pending queue is full. `undefined` is also rejected because the queue uses it internally to mean that no item is available.

```ts
if (!queue.addItem(job)) {
  saveForLater(job)
}
```

Capacity does not provide backpressure by itself because callers do not await an open slot. Handle rejection explicitly when dropping an item is unacceptable.

## Results and errors

Automatically scheduled work runs in the background. Observe results through `onSuccess` or by selecting `lastResult` through the adapter state. Observe failures through `onError` and selected error counters.

For direct control, `execute()` removes and processes one pending item. Its Promise resolves with the item that was processed, not the wrapped function's result. The result is passed to `onSuccess` and stored as `lastResult`.

Without `onError`, `throwOnError` defaults to `true`. Background scheduling catches that rejection after updating callbacks and state so the queue can continue. A direct call to `execute()` or `flush()` can reject to its caller. Providing `onError` changes the default to `false`.

Callbacks include:

- `onSuccess(result, item, queue)` after a successful item.
- `onError(error, item, queue)` after its retries fail.
- `onSettled(item, queue)` after either outcome.
- `onItemsChange(queue)` when the pending collection changes.
- `onReject(item, queue)` and `onExpire(item, queue)` for items that never execute.

An item is removed from the pending queue before its function starts. A failed item is not automatically added back.

## Retrying items

Each started item receives its own retryer:

```ts
const queue = createAsyncQueuer(processJob, {
  concurrency: 2,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

A retry remains part of the same active item and continues to occupy a concurrency slot. `maxAttempts` includes the first attempt. See the [Async Retrying Guide](./async-retrying.md) before retrying jobs with side effects.

## Starting, stopping, and flushing

Queues start automatically unless `started: false` is set.

- `stop()` prevents new automatic starts and clears pending wait timers. It does not abort active items or remove pending items.
- `start()` resumes automatic processing.
- `clear()` removes pending items. It does not affect active items.
- `flush(count?)` starts pending items immediately without normal wait spacing.
- `flushAsBatch(fn)` removes all pending items and passes them to one async batch function.

`flush()` uses direct executions and can start more work than the configured `concurrency`. Use it as an intentional drain operation, not as normal scheduling.

If any directly flushed item rejects with `throwOnError: true`, `flush()` rejects after all requested executions settle. Remaining pending work resumes afterward when the queue is running.

## Expiration

Pending items can expire through `expirationDuration` or `getIsExpired(item, addedAt)`. Expiration is checked when the queue ticks, not by a timer dedicated to each item. A stopped queue therefore evaluates stale items after it resumes.

Expired items are removed, call `onExpire`, and never reach the processing function. Active items do not expire.

## Aborting active work

`abort()` aborts the retryers for all active executions. It does not clear pending items. Cancellation reaches the underlying API only when the processing function uses its signal:

```ts
const queue = createAsyncQueuer(
  async (job: Job) => {
    return fetch(`/api/jobs/${job.id}`, {
      method: 'POST',
      signal: queue.getAbortSignal() ?? undefined,
    })
  },
  { concurrency: 2 },
)

queue.abort()
```

When multiple executions overlap, pass an `executeCount` to `getAbortSignal()` when you need a specific execution's signal.

### Resetting safely

`reset()` restores default state, including an empty pending queue and a running status. It does not clear the queue's wait timers or guarantee that active underlying work stops. Use explicit lifecycle methods first:

```ts
queue.stop()
queue.abort()
queue.reset()
```

## Solid lifecycle

The adapter stops automatic processing and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Configuration and reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const queue = createAsyncQueuer(processJob, { concurrency: 2 }, (state) => ({
  size: state.size,
  activeItems: state.activeItems,
  status: state.status,
}))

console.log(queue.state().size, queue.state().activeItems, queue.state().status)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`concurrency` and `wait` may be values or functions that receive the queue instance. `setOptions()` merges new options, and `asyncQueuerOptions()` creates reusable, type-checked option objects.

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers and active executions are not restored.

Common state includes:

- `items` and `size`: Pending work.
- `activeItems`: Work currently tracked as active.
- `isRunning`, `isIdle`, and `status`: Scheduler state.
- `isFull` and `rejectionCount`: Pending capacity state.
- `successCount`, `errorCount`, and `settledCount`: Execution outcomes.
- `lastResult`: The most recent successful processing result.

Use `peekPendingItems()`, `peekActiveItems()`, and `peekAllItems()` for copied item arrays. See the [Solid API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
