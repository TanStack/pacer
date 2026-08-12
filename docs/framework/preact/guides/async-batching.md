---
title: Preact Async Batching Guide
id: async-batching
---

Async batching keeps the collection and trigger behavior described in the [Batching Guide](./batching.md), while adding Promise results, retries, error callbacks, failed-item tracking, and control over in-flight work.

Use it when one async operation should process several collected items together. Use an [Async Queue](./async-queuing.md) when each item needs its own execution or when you need to limit concurrency.

## How async batching works

Items collect until any configured trigger fires:

```text
add A ─── add B ─── add C
  │         │         │
  └─ wait reset       └─ maxSize reached
                            │
                            └─ execute [A, B, C]
```

A batch executes when:

- its length reaches `maxSize`,
- `getShouldExecute(items, batcher)` returns `true`, or
- no new item arrives for `wait` milliseconds.

Both `maxSize` and `wait` default to `Infinity`, so configure at least one trigger or call `flush()` manually. The wait timer restarts on every addition. It measures a quiet period, not a maximum age for the oldest item.

## Choose an API

- `useAsyncBatchedCallback` for adding items
- `useAsyncBatcher` for flush, failed items, and selected execution state

## Preact example

```tsx
import { useAsyncBatcher } from '@tanstack/preact-pacer'

function AnalyticsButton() {
  const batcher = useAsyncBatcher(
    sendEvents,
    { maxSize: 20, wait: 1000 },
    (state) => ({
      size: state.size,
      isExecuting: state.isExecuting,
    }),
  )

  return (
    <button onClick={() => void batcher.addItem({ type: 'click' })}>
      Track ({batcher.state.size} pending)
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncBatcher` and assume they run inside a component or another hook.

## Promise results

`flush()` returns the batch function's result and is the clearest way to await a specific batch.

`addItem()` also returns a Promise, but it should not be treated as an individual item's result receipt:

- If that addition reaches `maxSize` or satisfies `getShouldExecute`, its Promise owns the triggered execution and resolves with the batch result.
- If it only schedules the wait timer, its Promise resolves without the later batch result.
- Another addition may reset the timer and change which items execute together.

Use `onSuccess`, `onError`, and `onSettled` when all additions need to observe the eventual batch outcome.

## Batch boundaries and overlapping work

The batcher copies and clears the current items before calling the async function. Items added while that function is active collect in a new batch:

```text
execute [A, B] ───────────────── finish
       add C ─── add D ─── execute [C, D] ─── finish
```

If the second batch's trigger fires before the first finishes, both batch functions can overlap. `useAsyncBatcher` does not have a concurrency option. Serialize batch executions outside the batcher or send the completed batches through an async queue when overlap is unsafe.

## Errors and failed items

Async batchers provide these callbacks:

- `onSuccess(result, batch, batcher)` after success.
- `onError(error, batch, batcher)` after the batch's retries fail.
- `onSettled(batch, batcher)` after either outcome.
- `onItemsChange(batcher)` when items are added or removed for execution.

Without `onError`, `throwOnError` defaults to `true`, so `flush()` or a size-triggering `addItem()` rejects on failure. Providing `onError` changes that default to `false`; the Promise then resolves with `undefined`.

Items are removed from the pending collection before execution. A failed batch is not automatically requeued. Its items are added to `failedItems` and are available through `peekFailedItems()` until `clear()` or a later execution clears that collection.

```ts
const failed = batcher.peekFailedItems()
for (const item of failed) {
  saveForManualRecovery(item)
}
```

For non-idempotent operations, verify the server outcome before resubmitting a failed batch.

## Retrying batches

Configure retries for each batch execution with `asyncRetryerOptions`:

```ts
const batcher = useAsyncBatcher(sendEvents, {
  maxSize: 20,
  wait: 1000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt, and every retry receives the same copied batch. See the [Async Retrying Guide](./async-retrying.md) before retrying operations with side effects.

## Flushing, canceling, and clearing

- `flush()` clears the pending timer and immediately executes the current items.
- `cancel()` clears the pending timer but keeps the collected items.
- `clear()` removes collected items and failed items, but does not clear a scheduled timer.
- `peekAllItems()` returns a copy of the currently collected items.

Because `clear()` leaves the timer in place, use `cancel()` followed by `clear()` when no empty timer should remain:

```ts
batcher.cancel()
batcher.clear()
```

The batch function is not called when an eventual timer or `flush()` finds no items.

## Aborting active work

`abort()` aborts active retryers. It does not cancel a pending batch or remove collected items. Pass the batcher's signal to the underlying API for cancellation to propagate:

```ts
const batcher = useAsyncBatcher(
  async (events: Array<AnalyticsEvent>) => {
    return fetch('/api/analytics/batch', {
      method: 'POST',
      body: JSON.stringify(events),
      signal: batcher.getAbortSignal() ?? undefined,
    })
  },
  { maxSize: 20, wait: 1000 },
)

batcher.abort()
```

When executions overlap, pass an `executeCount` to `getAbortSignal()` when you need a specific execution's signal.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled timer or guarantee that active underlying work stops. Use the lifecycle methods first when a complete cleanup is required:

```ts
batcher.cancel()
batcher.abort()
batcher.reset()
```

## Preact lifecycle

The adapter cancels the pending wait timer and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Configuration and reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const batcher = useAsyncBatcher(
  sendEvents,
  { maxSize: 20, wait: 1000 },
  (state) => ({
    size: state.size,
    isExecuting: state.isExecuting,
    failedItems: state.failedItems,
  }),
)

console.log(
  batcher.state.size,
  batcher.state.isExecuting,
  batcher.state.failedItems,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`wait` may be a number or a function that receives the batcher instance. `setOptions()` merges new options, and `asyncBatcherOptions()` creates reusable, type-checked option objects.

Do not use `started` to pause a batcher. It is currently a no-op, so every `addItem()` call evaluates the configured triggers.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Common state includes:

- `items`, `size`, and `isPending`: The next batch and its timer state.
- `isExecuting`: Whether a batch is reported as executing.
- `lastResult`: The most recent successful result.
- `failedItems` and `totalItemsFailed`: Failure tracking.
- `successCount`, `errorCount`, and `settleCount`: Batch outcome counts.
- `totalItemsProcessed`: Items in successful batch executions.

See the [Preact API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
