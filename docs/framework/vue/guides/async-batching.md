---
title: Vue Async Batching Guide
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

## Use useAsyncBatcher

Call composables during component setup or inside an active Vue effect scope. Disposing the scope stops option watchers and subscriptions and cleans up the utility. Read selected state through `utility.state.value` in JavaScript; Vue templates unwrap refs.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer'
const input = ref('hello')
const wait = ref(200)
const history = ref<Array<Array<string>>>([])
const utility = useAsyncBatcher(async (value: Array<string>) => { history.value = [...history.value, value] }, () => ({ wait: wait.value, maxSize: 3 }), (state) => state)
const state = utility.state
function schedule() { void utility.addItem(input.value) }
function burst() { for (let i = 1; i <= 3; i++) void utility.addItem(`${input.value} ${i}`) }
</script>
<template>
<main>
<h1>Vue useAsyncBatcher</h1><p>Collect events into batches of up to three items, or process them after the wait period.</p>
<label>Task <input v-model="input" /></label><label>Wait (ms) <input v-model.number="wait" type="number" min="0" /></label>
<div><button @click="schedule">Schedule</button><button @click="burst">Schedule three</button><button @click="utility.flush()">Flush</button><button @click="utility.cancel()">Cancel</button><button @click="history = []">Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{ JSON.stringify(history, null, 2) }}</pre></section>
<section><h2>Utility state</h2><pre>{{ JSON.stringify(state, null, 2) }}</pre></section>
<p class="caption">Change the wait while work is pending to update options on the same instance. Removing this component cleans up its utility.</p>
</main>
</template>
```

## Options and controls

`addItem` appends one item. `maxSize` executes a full batch; `wait` bounds how long a partial batch waits. Use `flush()` to process pending items immediately, `cancel()` to cancel the timer, and `reset()` to restore state. Read `items`, `size`, and `settleCount` with a selector.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncBatchedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Vue adapter](../adapter.md)
- [Core async batching guide](../../../guides/async-batching.md)
- [API reference](../reference/index.md)
