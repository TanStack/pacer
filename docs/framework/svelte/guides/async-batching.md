---
title: Svelte Async Batching Guide
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

## Use createAsyncBatcher

Call factories during component initialization. Options update in a pre-render effect. Read selected state through `utility.state` without destructuring it outside a reactive expression. Component destruction releases subscriptions and cleans up the utility.

```svelte
<script lang="ts">
import { createAsyncBatcher } from '@tanstack/svelte-pacer'
let input = $state('hello')
let wait = $state(200)
let history = $state<Array<Array<string>>>([])
const utility = createAsyncBatcher(async (value: Array<string>) => { history = [...history, value] }, () => ({ wait: wait, maxSize: 3 }), (state) => state)
function schedule() { void utility.addItem(input) }
function burst() { for (let i = 1; i <= 3; i++) void utility.addItem(`${input} ${i}`) }
</script>
<main>
<h1>Svelte createAsyncBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
<label>Task <input bind:value={input} /></label><label>Wait (ms) <input bind:value={wait} type="number" min="0" /></label>
<div><button onclick={schedule}>Schedule</button><button onclick={burst}>Schedule three</button><button onclick={() => utility.flush()}>Flush</button><button onclick={() => utility.cancel()}>Cancel</button><button onclick={() => history = []}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">Reactive options preserve pending work. Component teardown cleans up the utility.</p>
</main>
```

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `settleCount` with a selector.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Svelte adapter](../adapter.md)
- [Core async batching guide](../../../guides/async-batching.md)
- [API reference](../reference/index.md)
