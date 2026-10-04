---
title: Alpine Adapter
id: adapter
---

The `alpine-pacer` adapter connects Pacer scheduling utilities to Alpine state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/alpine-pacer
```

The package is ESM-only and requires Node.js 20 or newer when running in Node.js.

## Lifecycle and state

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `createBatcher` | `createBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `createDebouncer` | `createDebouncedCallback`, `createDebouncedState`, `createDebouncedValue` |
| [queuing](./guides/queuing.md) | `createQueuer` | `createQueuedState`, `createQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `createRateLimiter` | `createRateLimitedCallback`, `createRateLimitedState`, `createRateLimitedValue` |
| [throttling](./guides/throttling.md) | `createThrottler` | `createThrottledCallback`, `createThrottledState`, `createThrottledValue` |
| [async batching](./guides/async-batching.md) | `createAsyncBatcher` | `createAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `createAsyncDebouncer` | `createAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `createAsyncQueuer` | `createAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `createAsyncRateLimiter` | `createAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `createAsyncThrottler` | `createAsyncThrottledCallback` |

## Example

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineDebouncer } from '@tanstack/alpine-pacer'
import type { DebouncerState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineDebouncer<(value: string) => void, DebouncerState<(value: string) => void>> | null,
  init() {
    this.utility = this.scope.createDebouncer((value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait }), (state) => state)
  },
  schedule() { void this.utility?.maybeExecute(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.maybeExecute(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Pass defaults to `createPacerScope`, either as an object or a factory. All utilities created through that scope inherit them. Use utility keys such as `debouncer` and `asyncQueuer`; local options take precedence.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Read values by calling their accessors. Setters accept a new value or a functional update. Queue state helpers return `[itemsAccessor, addItem, utility]`. Queued value helpers return the last processed value, rather than the list of pending items.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

The utilities emit the same Pacer devtools events as the other adapters. Use the framework-independent `@tanstack/pacer-devtools` panel when your application supplies a devtools host.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
