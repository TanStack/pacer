---
title: Vue Adapter
id: adapter
---

The `vue-pacer` adapter connects Pacer scheduling utilities to Vue state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/vue-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Call composables during component setup or inside an active Vue effect scope. Disposing the scope stops option watchers and subscriptions and cleans up the utility. Read selected state through `utility.state.value` in JavaScript; Vue templates unwrap refs.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `useBatcher` | `useBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `useDebouncer` | `useDebouncedCallback`, `useDebouncedState`, `useDebouncedValue` |
| [queuing](./guides/queuing.md) | `useQueuer` | `useQueuedState`, `useQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `useRateLimiter` | `useRateLimitedCallback`, `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./guides/throttling.md) | `useThrottler` | `useThrottledCallback`, `useThrottledState`, `useThrottledValue` |
| [async batching](./guides/async-batching.md) | `useAsyncBatcher` | `useAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `useAsyncDebouncer` | `useAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `useAsyncQueuer` | `useAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `useAsyncRateLimiter` | `useAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `useAsyncThrottler` | `useAsyncThrottledCallback` |

## Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer'
const input = ref('hello')
const wait = ref(200)
const history = ref<Array<string>>([])
const utility = useDebouncer((value: string) => { history.value = [...history.value, value] }, () => ({ wait: wait.value }), (state) => state)
const state = utility.state
function schedule() { void utility.maybeExecute(input.value) }
function burst() { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input.value} ${i}`) }
</script>
<template>
<main>
<h1>Vue useDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input v-model="input" /></label><label>Wait (ms) <input v-model.number="wait" type="number" min="0" /></label>
<div><button @click="schedule">Schedule</button><button @click="burst">Schedule three</button><button @click="utility.flush()">Flush</button><button @click="utility.cancel()">Cancel</button><button @click="history = []">Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{{ JSON.stringify(history, null, 2) }}</pre></section>
<section><h2>Utility state</h2><pre>{{ JSON.stringify(state, null, 2) }}</pre></section>
<p class="caption">Change the wait while work is pending to update options on the same instance. Removing this component cleans up its utility.</p>
</main>
</template>
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider` or call `providePacerOptions` during setup. Both accept defaults grouped by utility, such as `{ debouncer: { leading: true } }`. Provider defaults remain reactive and local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read the Vue ref through `.value` in JavaScript. Setters accept a new value or a functional update. Queue state helpers return `[itemsAccessor, addItem, utility]`. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/vue-pacer-devtools` and render `PacerDevtoolsPanel` inside a container with a defined height. See the [devtools setup](../../devtools.md) for an example. The `/production` entry explicitly includes the panel in production builds.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
