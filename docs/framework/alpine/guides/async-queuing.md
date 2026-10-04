---
title: Alpine Async Queuing Guide
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

- `useAsyncQueuedState` for reactive pending items
- `useAsyncQueuer` for concurrency, ordering, and lifecycle control

## Use createAsyncQueuer

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncQueuer } from '@tanstack/alpine-pacer'
import type { AsyncQueuerState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineAsyncQueuer<string, AsyncQueuerState<string>> | null,
  init() {
    this.utility = this.scope.createAsyncQueuer(async (value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, started: false }), (state) => state)
  },
  schedule() { void this.utility?.addItem(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.addItem(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
```

## Options and controls

`addItem` adds a task; `start()` and `stop()` control processing. `wait` spaces executions, `maxSize` limits pending items, and `getPriority` controls priority. `initialItems` supplies initial work. Expiration options remove obsolete items. Select `items`, `size`, `isRunning`, and `settleCount` to display progress. Stopping preserves pending items.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

Use `concurrency` to bound active tasks. `items` contains pending work; use `activeItems` and `isRunning` when presenting task status. Stopping prevents new tasks from starting; aborting signals active tasks to stop.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncQueuedState` selects pending items by default. It retains the async queue controls, including concurrency and abort.

## Related documentation

- [Alpine adapter](../adapter.md)
- [Core async queuing guide](../../../guides/async-queuing.md)
- [API reference](../reference/index.md)
