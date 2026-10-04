---
title: Alpine Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## Use createAsyncRateLimiter

Create a `createPacerScope()` for each component and call `scope.destroy()` from Alpine's `destroy` hook. Scope methods own option effects, state subscriptions, and utility cleanup. Alternatively, install `pacerPlugin` to use the automatically owned `$pacer` magic. Read selected state through `utility.state`.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncRateLimiter } from '@tanstack/alpine-pacer'
import type { AsyncRateLimiterState } from '@tanstack/alpine-pacer'
Alpine.data('example', () => ({
  input: 'hello', wait: 200, history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineAsyncRateLimiter<(value: string) => Promise<void>, AsyncRateLimiterState<(value: string) => Promise<void>>> | null,
  init() {
    this.utility = this.scope.createAsyncRateLimiter(async (value: string) => { this.history = [...this.history, value] }, () => ({ limit: 2, window: this.wait }), (state) => state)
  },
  schedule() { void this.utility?.maybeExecute(this.input) },
  burst() { for (let i = 1; i <= 3; i++) void this.utility?.maybeExecute(`${this.input} ${i}`) },
  destroy() { this.scope.destroy() },
}))
Alpine.start()
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

`createAsyncRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Alpine adapter](../adapter.md)
- [Core async rate limiting guide](../../../guides/async-rate-limiting.md)
- [API reference](../reference/index.md)
