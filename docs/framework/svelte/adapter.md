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

| Utility | Instance API | State and value helpers |
| ------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------- |
| [batching](./guides/batching.md) | `createBatcher` | None |
| [debouncing](./guides/debouncing.md) | `createDebouncer` | `createDebouncedSignal`, `createDebouncedValue` |
| [queuing](./guides/queuing.md) | `createQueuer` | `createQueuedSignal`, `createQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `createRateLimiter` | `createRateLimitedSignal`, `createRateLimitedValue` |
| [throttling](./guides/throttling.md) | `createThrottler` | `createThrottledSignal`, `createThrottledValue` |
| [async batching](./guides/async-batching.md) | `createAsyncBatcher` | None |
| [async debouncing](./guides/async-debouncing.md) | `createAsyncDebouncer` | None |
| [async queuing](./guides/async-queuing.md) | `createAsyncQueuer` | `createAsyncQueuedSignal` |
| [async rate limiting](./guides/async-rate-limiting.md) | `createAsyncRateLimiter` | None |
| [async throttling](./guides/async-throttling.md) | `createAsyncThrottler` | None |

## Example

This counter coalesces rapid clicks into one update after 500 ms. Flush applies the latest pending count immediately.

```svelte
<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer'

  let count = $state(0)
  let debouncedCount = $state(0)
  const debouncer = createDebouncer(
    (value: number) => {
      debouncedCount = value
    },
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  )
  function increment() {
    debouncer.maybeExecute(++count)
  }
</script>

<button onclick={increment}>Increment</button>
<p>Count: {count}. Debounced: {debouncedCount}.</p>
<p>Pending: {debouncer.state.isPending}</p>
<button onclick={() => debouncer.flush()}>Flush</button>
```

## Child subscriptions

Use `utility.Subscribe` with a child snippet to select state without updating the utility owner's selection. Removing the component releases its subscription.

```svelte
<debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {#snippet children({ isPending })}
    <span>Pending: {isPending}</span>
  {/snippet}
</debouncer.Subscribe>
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider`, or call `providePacerOptions(() => defaults)` during component initialization. Group defaults by utility, such as `{ debouncer: { leading: true } }`. Local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Event handlers and value helpers

Use an instance method as the event handler: `maybeExecute` for debouncing, throttling, and rate limiting, or `addItem` for batching. The instance also provides control methods and state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Synchronous queue state helpers return `[itemsAccessor, addItem, utility]`. Async queue state helpers return `[itemsAccessor, utility]`; call `utility.addItem()` to enqueue an item. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

Install `@tanstack/svelte-pacer-devtools` and use `pacerDevtoolsPlugin` with the framework TanStack Devtools integration. The `/production` entry explicitly includes the panel in production builds.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
