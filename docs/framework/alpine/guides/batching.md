---
title: Alpine Batching Guide
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

- `useBatchedCallback` for a stable item-adder
- `useBatcher` for flush, cancel, collected items, and selected state

Use the callback API when adding items is all the component needs. Use the instance API for `flush()`, `cancel()`, collected items, selected state, and dynamic options.

## Use createBatcher

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineBatcher } from '@tanstack/alpine-pacer'
import type { BatcherState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<Array<string>>,
  scope: createPacerScope(),
  utility: null as AlpineBatcher<string, BatcherState<string>> | null,
  init() {
    this.utility = this.scope.createBatcher((value: Array<string>) => { this.history = [...this.history, value] }, () => ({ wait: this.wait, maxSize: 3 }), (state) => state)
  },
  schedule() { void this.utility?.addItem(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.addItem(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
```

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `executionCount` with a selector.
## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Alpine adapter](../adapter.md)
- [Core batching guide](../../../guides/batching.md)
- [API reference](../reference/index.md)
