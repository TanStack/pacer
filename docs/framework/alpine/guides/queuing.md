---
title: Alpine Queuing Guide
id: queuing
---

Queuing stores operations in an ordered buffer and processes them individually. It is the primary Pacer strategy for work that should not be discarded when calls arrive faster than they can run.

Queues are lossless only while they have capacity. A finite `maxSize`, explicit clearing, expiration, or a processing error can still remove or reject work.

## How queuing works

```text
Queuing (process one item every 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Queue:       [ABC]   [BC]    [BCDE]    [DE]    [E]    []
Executed:     ✅     ✅       ✅        ✅      ✅     ✅
             [======================================================]
             ^ Accepted items remain queued until processed

             [Items arrive]    [Process steadily]      [Empty]
```

The queue can process automatically with a delay between items, or remain stopped for manual processing.

## When to use queuing

Choose queuing when:

- Every accepted operation should run individually.
- Processing order matters.
- Incoming work may temporarily exceed processing capacity.
- A maximum buffer size should reject excess work explicitly.
- FIFO, LIFO, or priority ordering is required.

Choose another utility when:

- Only the final call matters. Use [debouncing](./debouncing.md).
- Intermediate calls may be discarded while work runs steadily. Use [throttling](./throttling.md).
- Calls should be rejected after a time-window quota. Use [rate limiting](./rate-limiting.md).
- Items should run together. Use [batching](./batching.md).
- Tasks return Promises or should run concurrently. Use [async queuing](./async-queuing.md).

## Choose an API

- `useQueuedState` or `useQueuedValue` for a queue connected to Alpine state
- `useQueuer` for direct queue lifecycle and ordering control

Use the queued state or value API when queue contents drive the UI. Use the instance API for ordering, capacity, expiration, pause, resume, flush, and manual processing.

## Use createQueuer

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineQueuer } from '@tanstack/alpine-pacer'
import type { QueuerState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineQueuer<string, QueuerState<string>> | null,
  init() {
    this.utility = this.scope.createQueuer((value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, started: false }), (state) => state)
  },
  schedule() { void this.utility?.addItem(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.addItem(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
```

## Options and controls

`addItem` adds a task; `start()` and `stop()` control processing. `wait` spaces executions, `maxSize` limits pending items, and `getPriority` controls priority. `initialItems` supplies initial work. Expiration options remove obsolete items. Select `items`, `size`, `isRunning`, and `executionCount` to display progress. Stopping preserves pending items.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createQueuedState` selects pending items by default. `createQueuedValue` tracks the last processed value from a changing source.

## Related documentation

- [Alpine adapter](../adapter.md)
- [Core queuing guide](../../../guides/queuing.md)
- [API reference](../reference/index.md)
