---
title: Solid Async Debouncing Guide
id: async-debouncing
---

Async debouncing keeps the timing behavior described in the [Debouncing Guide](./debouncing.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use async debouncing when the debounced operation returns a value you need, can reject, or needs retry and abort support. The synchronous debouncing adapter can call an async function as a side effect, but it does not manage the resulting Promise.

## Choose an API

- `createAsyncDebouncer` for Promise results, lifecycle methods, and selected state

## Solid example

```tsx
import { createAsyncDebouncer } from '@tanstack/solid-pacer'

const search = createAsyncDebouncer(
  fetchSearchResults,
  { wait: 300 },
  (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
  }),
)

void search.maybeExecute('pacer')
console.log(search.state().isPending)
```

The focused snippets later in this guide use `createAsyncDebouncer` and assume they run inside a Solid reactive owner.

## Promise results

`maybeExecute()` returns a Promise. A call that owns an execution resolves with that execution's result. There is one important consequence when a pending trailing call is replaced:

```text
call A ──────┐
             ├─ call B replaces A ───── wait ───── execute B
Promise A ───┘ resolves with the previous lastResult
Promise B ─────────────────────────────── resolves with result B
```

The replaced call resolves immediately with the debouncer's current `lastResult`, which is often `undefined` before the first successful execution. It does not wait for the newer call. Treat the Promise returned by the latest call as the owner of the pending result.

If you need every invocation to execute and produce its own result, use an [Async Queue](./async-queuing.md) instead.

## Leading and trailing execution

The four combinations match synchronous debouncing:

| `leading` | `trailing` | Behavior                                                                           |
| --------- | ---------- | ---------------------------------------------------------------------------------- |
| `false`   | `true`     | Execute after calls stop for `wait` milliseconds. This is the default.             |
| `true`    | `false`    | Execute immediately, then ignore calls until the quiet period ends.                |
| `true`    | `true`     | Execute the first call immediately and the latest later call on the trailing edge. |
| `false`   | `false`    | Record calls without executing the function.                                       |

With both edges enabled, a single call executes only on the leading edge. A trailing execution requires another call during the wait period.

## Errors and callbacks

Async debouncers provide callbacks around each actual execution:

- `onSuccess(result, args, debouncer)` runs after a successful execution.
- `onError(error, args, debouncer)` runs after the retries for an execution fail.
- `onSettled(args, debouncer)` runs after either outcome.

Without `onError`, `throwOnError` defaults to `true`, so an execution failure rejects the Promise. Providing `onError` changes that default to `false`; the Promise then resolves with the current `lastResult`. Set `throwOnError` explicitly when you want different behavior.

Callbacks run for executions, not for every call to `maybeExecute()`. Replaced or canceled pending calls never reach the wrapped function.

## Retrying failed executions

Pass `asyncRetryerOptions` to retry an execution after it starts:

```ts
const save = createAsyncDebouncer(saveDraft, {
  wait: 500,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. Debouncing decides when one logical execution starts; the retryer then manages attempts for that execution. See the [Async Retrying Guide](./async-retrying.md) for retry safety, backoff, and timeout behavior.

## Canceling pending work and aborting active work

Pending and active work have separate controls:

- `cancel()` clears a trailing execution that has not started. It does not stop an active Promise.
- `abort()` aborts active executions. It does not clear a pending trailing execution.
- `flush()` starts pending work immediately and returns its result. It does not affect active work.

For an underlying operation such as `fetch` to stop, pass the debouncer's signal to it:

```ts
const search = createAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: search.getAbortSignal() ?? undefined,
    })
    return response.json()
  },
  { wait: 300 },
)

search.maybeExecute('pacer')
search.abort()
```

Calling `abort()` without using the signal stops retry management but cannot force an arbitrary Promise to stop.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled trailing timeout or guarantee that active work stops. Use the lifecycle methods first when you need a complete cleanup:

```ts
search.cancel()
search.abort()
search.reset()
```

## Configuration

`wait` and `enabled` may be values or functions that receive the debouncer instance. `setOptions()` merges new options into the current configuration.

```ts
search.setOptions({
  enabled: (debouncer) => debouncer.store.state.errorCount < 3,
  wait: (debouncer) => (debouncer.store.state.successCount === 0 ? 200 : 500),
})
```

Changing `wait` does not reschedule an existing timeout. The new value applies when later work is scheduled.

Use `asyncDebouncerOptions()` to define reusable, type-checked option objects.

## Solid lifecycle

The adapter cancels pending work and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const debouncer = createAsyncDebouncer(
  fetchSearchResults,
  { wait: 300 },
  (state) => ({
    isPending: state.isPending,
    isExecuting: state.isExecuting,
    lastResult: state.lastResult,
  }),
)

console.log(
  debouncer.state().isPending,
  debouncer.state().isExecuting,
  debouncer.state().lastResult,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The arguments retained for pending work.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.
- `status`: `'disabled'`, `'idle'`, `'pending'`, `'executing'`, or `'settled'`.

See the [Solid API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
