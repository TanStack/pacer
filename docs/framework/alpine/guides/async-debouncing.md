---
title: Alpine Async Debouncing Guide
id: async-debouncing
---

Async debouncing keeps the timing behavior described in the [Debouncing Guide](./debouncing.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use async debouncing when the debounced operation returns a value you need, can reject, or needs retry and abort support. The synchronous debouncing adapter can call an async function as a side effect, but it does not manage the resulting Promise.

## Choose an API

- `useAsyncDebouncedCallback` for a stable Promise-returning handler
- `useAsyncDebouncer` for lifecycle methods and selected execution state

## Use createAsyncDebouncer

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncDebouncer } from '@tanstack/alpine-pacer'
import type { AsyncDebouncerState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineAsyncDebouncer<(value: string) => Promise<void>, AsyncDebouncerState<(value: string) => Promise<void>>> | null,
  init() {
    this.utility = this.scope.createAsyncDebouncer(async (value: string) => { this.history = [...this.history, value] }, () => ({ wait: this.wait }), (state) => state)
  },
  schedule() { void this.utility?.maybeExecute(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.maybeExecute(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
```

## Options and controls

`maybeExecute` schedules the latest arguments. `wait` resets after each call. `leading` runs the first call immediately and `trailing` controls the deferred call. Use `flush()` to execute pending work, `cancel()` to discard its timer, and `reset()` to reset counters. Select `isPending`, `lastArgs`, or `settleCount` for your UI.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning scope supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`createAsyncDebouncedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Alpine adapter](../adapter.md)
- [Core async debouncing guide](../../../guides/async-debouncing.md)
- [API reference](../reference/index.md)
