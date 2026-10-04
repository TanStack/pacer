---
title: Svelte Async Throttling Guide
id: async-throttling
---

Async throttling keeps the timing behavior described in the [Throttling Guide](./throttling.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when a throttled operation returns a value you need, can reject, or needs retry and abort support. The synchronous throttling adapter can invoke an async function as a side effect, but it does not manage the resulting Promise.

## Choose an API

- `useAsyncThrottledCallback` for a stable Promise-returning handler
- `useAsyncThrottler` for lifecycle methods and selected execution state

## Use createAsyncThrottler

Call factories during component initialization. Options update in a pre-render effect. Read selected state through `utility.state` without destructuring it outside a reactive expression. Component destruction releases subscriptions and cleans up the utility.

```svelte
<script lang="ts">
import { createAsyncThrottler } from '@tanstack/svelte-pacer'
let input = $state('hello')
let wait = $state(200)
let history = $state<Array<string>>([])
const utility = createAsyncThrottler(async (value: string) => { history = [...history, value] }, () => ({ wait: wait, leading: false }), (state) => state)
function schedule() { void utility.maybeExecute(input) }
function burst() { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input} ${i}`) }
</script>
<main>
<h1>Svelte createAsyncThrottler</h1><p>Limit executions to one per interval while retaining the latest trailing call.</p>
<label>Task <input bind:value={input} /></label><label>Wait (ms) <input bind:value={wait} type="number" min="0" /></label>
<div><button onclick={schedule}>Schedule</button><button onclick={burst}>Schedule three</button><button onclick={() => utility.flush()}>Flush</button><button onclick={() => utility.cancel()}>Cancel</button><button onclick={() => history = []}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">Reactive options preserve pending work. Component teardown cleans up the utility.</p>
</main>
```

## Options and controls

`maybeExecute` limits executions to one per `wait` interval. `leading` controls the first execution and `trailing` retains the most recent deferred call. Use `flush()` to execute pending work and `cancel()` to discard its timer. Select `isPending`, `lastArgs`, and `settleCount` to render progress.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncThrottledCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Svelte adapter](../adapter.md)
- [Core async throttling guide](../../../guides/async-throttling.md)
- [API reference](../reference/index.md)
