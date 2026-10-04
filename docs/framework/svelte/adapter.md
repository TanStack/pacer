---
title: Svelte Adapter
id: adapter
---

The `svelte-pacer` adapter connects Pacer scheduling utilities to Svelte state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/svelte-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Call factories during component initialization. Options update in a pre-render effect. Read selected state through `utility.state` without destructuring it outside a reactive expression. Component destruction releases subscriptions and cleans up the utility.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `createBatcher` | `createBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `createDebouncer` | `createDebouncedCallback`, `createDebouncedSignal`, `createDebouncedValue` |
| [queuing](./guides/queuing.md) | `createQueuer` | `createQueuedSignal`, `createQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `createRateLimiter` | `createRateLimitedCallback`, `createRateLimitedSignal`, `createRateLimitedValue` |
| [throttling](./guides/throttling.md) | `createThrottler` | `createThrottledCallback`, `createThrottledSignal`, `createThrottledValue` |
| [async batching](./guides/async-batching.md) | `createAsyncBatcher` | `createAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `createAsyncDebouncer` | `createAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `createAsyncQueuer` | `createAsyncQueuedSignal` |
| [async rate limiting](./guides/async-rate-limiting.md) | `createAsyncRateLimiter` | `createAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `createAsyncThrottler` | `createAsyncThrottledCallback` |

## Example

```svelte
<script lang="ts">
import { createDebouncer } from '@tanstack/svelte-pacer'
let input = $state('hello')
let wait = $state(200)
let history = $state<Array<string>>([])
const utility = createDebouncer((value: string) => { history = [...history, value] }, () => ({ wait: wait }), (state) => state)
function schedule() { void utility.maybeExecute(input) }
function burst() { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input} ${i}`) }
</script>
<main>
<h1>Svelte createDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input bind:value={input} /></label><label>Wait (ms) <input bind:value={wait} type="number" min="0" /></label>
<div><button onclick={schedule}>Schedule</button><button onclick={burst}>Schedule three</button><button onclick={() => utility.flush()}>Flush</button><button onclick={() => utility.cancel()}>Cancel</button><button onclick={() => history = []}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">Reactive options preserve pending work. Component teardown cleans up the utility.</p>
</main>
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider`, or call `providePacerOptions(() => defaults)` during component initialization. Group defaults by utility, such as `{ debouncer: { leading: true } }`. Local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Queue state helpers return `[itemsAccessor, addItem, utility]`. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/svelte-pacer-devtools` and use `pacerDevtoolsPlugin` with the framework TanStack Devtools integration. The `/production` entry explicitly includes the panel in production builds.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
