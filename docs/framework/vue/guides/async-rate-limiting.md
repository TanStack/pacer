---
title: Vue Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## Use useAsyncRateLimiter

Call composables during component setup or inside an active Vue effect scope. Disposing the scope stops option watchers and subscriptions and cleans up the utility. Read selected state through `utility.state.value` in JavaScript; Vue templates unwrap refs.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncRateLimiter } from '@tanstack/vue-pacer'
const input = ref('hello')
const wait = ref(200)
const history = ref<Array<string>>([])
const utility = useAsyncRateLimiter(async (value: string) => { history.value = [...history.value, value] }, () => ({ limit: 2, window: wait.value }), (state) => state)
const state = utility.state
function schedule() { void utility.maybeExecute(input.value) }
function burst() { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input.value} ${i}`) }
</script>
<template>
<main>
<h1>Vue useAsyncRateLimiter</h1><p>Accept up to two executions per time window and track rejected calls.</p>
<label>Task <input v-model="input" /></label><label>Wait (ms) <input v-model.number="wait" type="number" min="0" /></label>
<div><button @click="schedule">Schedule</button><button @click="burst">Schedule three</button><button @click="utility.reset()">Reset window</button><button @click="utility.abort()">Reset</button><button @click="history = []">Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{ JSON.stringify(history, null, 2) }}</pre></section>
<section><h2>Utility state</h2><pre>{{ JSON.stringify(state, null, 2) }}</pre></section>
<p class="caption">Change the wait while work is pending to update options on the same instance. Removing this component cleans up its utility.</p>
</main>
</template>
```

## Options and controls

`maybeExecute` accepts or rejects each call based on `limit` and `window`. Rejected calls are not queued for later. `reset()` clears the window and state. Function-valued limits can inspect the limiter at execution time. Select `settleCount` and `rejectionCount` to show accepted and rejected attempts.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Vue adapter](../adapter.md)
- [Core async rate limiting guide](../../../guides/async-rate-limiting.md)
- [API reference](../reference/index.md)
