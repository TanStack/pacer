---
title: Svelte Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## Use createAsyncRateLimiter

Call factories during component initialization. Options update in a pre-render effect. Read selected state through `utility.state` without destructuring it outside a reactive expression. Component destruction releases subscriptions and cleans up the utility.

```svelte
<script lang="ts">
import { createAsyncRateLimiter } from '@tanstack/svelte-pacer'
let input = $state('hello')
let wait = $state(200)
let history = $state<Array<string>>([])
const utility = createAsyncRateLimiter(async (value: string) => { history = [...history, value] }, () => ({ limit: 2, window: wait }), (state) => state)
function schedule() { void utility.maybeExecute(input) }
function burst() { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input} ${i}`) }
</script>
<main>
<h1>Svelte createAsyncRateLimiter</h1><p>Accept up to two executions per time window and track rejected calls.</p>
<label>Task <input bind:value={input} /></label><label>Wait (ms) <input bind:value={wait} type="number" min="0" /></label>
<div><button onclick={schedule}>Schedule</button><button onclick={burst}>Schedule three</button><button onclick={() => utility.reset()}>Reset window</button><button onclick={() => utility.abort()}>Reset</button><button onclick={() => history = []}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">Reactive options preserve pending work. Component teardown cleans up the utility.</p>
</main>
```

## Options and controls

`maybeExecute` accepts or rejects each call based on `limit` and `window`. Rejected calls are not queued for later. `reset()` clears the window and state. Function-valued limits can inspect the limiter at execution time. Select `settleCount` and `rejectionCount` to show accepted and rejected attempts.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Svelte adapter](../adapter.md)
- [Core async rate limiting guide](../../../guides/async-rate-limiting.md)
- [API reference](../reference/index.md)
