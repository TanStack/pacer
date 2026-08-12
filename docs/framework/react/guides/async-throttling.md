---
title: React Async Throttling Guide
id: async-throttling
---

Async throttling keeps the timing behavior described in the [Throttling Guide](./throttling.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when a throttled operation returns a value you need, can reject, or needs retry and abort support. The synchronous throttling adapter can invoke an async function as a side effect, but it does not manage the resulting Promise.

## Choose an API

- `useAsyncThrottledCallback` for a stable Promise-returning handler
- `useAsyncThrottler` for lifecycle methods and selected execution state

## React example

```tsx
import { useAsyncThrottler } from '@tanstack/react-pacer'

function SaveButton() {
  const saver = useAsyncThrottler(savePosition, { wait: 1000 }, (state) => ({
    isExecuting: state.isExecuting,
    isPending: state.isPending,
  }))

  return (
    <button
      onClick={() => void saver.maybeExecute(42)}
      disabled={saver.state.isExecuting}
    >
      Save
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncThrottler` and assume they run inside a component or another hook.

## Promise results

`maybeExecute()` returns a Promise. An immediate or trailing execution resolves with its result. When another call replaces pending trailing work, the older pending Promise resolves with the throttler's current `lastResult`:

```text
call A ─── execute A ─── result A
                  call B ───┐
                            ├─ call C replaces B ─── execute C
Promise B ──────────────────┘ resolves with result A
Promise C ────────────────────────────────────────── resolves with result C
```

The replaced call does not wait for the newer trailing execution. If every call needs its own execution and result, use an [Async Queue](./async-queuing.md).

An async throttler also avoids starting its next scheduled execution while the current execution is still active. The `wait` interval still controls throttle timing, while the Promise lifecycle can delay when later work is scheduled.

## Leading and trailing execution

The edge combinations match synchronous throttling:

| `leading` | `trailing` | Behavior                                                                                        |
| --------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `true`    | `true`     | Execute immediately and retain the latest call for one trailing execution. This is the default. |
| `true`    | `false`    | Execute immediately and discard calls made during the interval.                                 |
| `false`   | `true`     | Wait one interval before the first execution, then retain the latest call in each interval.     |
| `false`   | `false`    | Record calls without executing the function.                                                    |

Unlike debouncing, calls during the interval do not restart the interval. They only replace the pending trailing arguments.

## Errors and callbacks

Async throttlers provide callbacks around each actual execution:

- `onSuccess(result, args, throttler)` runs after success.
- `onError(error, args, throttler)` runs after the retries for an execution fail.
- `onSettled(args, throttler)` runs after either outcome.

Without `onError`, `throwOnError` defaults to `true`, so a failure rejects the Promise that owns the execution. Providing `onError` changes that default to `false`; the Promise then resolves with the current `lastResult`. Set `throwOnError` explicitly to override the default.

Callbacks describe executions, not every call to `maybeExecute()`. Replaced or discarded calls do not produce execution callbacks.

## Retrying failed executions

Configure the retryer used for each execution with `asyncRetryerOptions`:

```ts
const saver = useAsyncThrottler(savePositionToServer, {
  wait: 1000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. Throttling controls logical executions; retrying controls the attempts within each execution. See the [Async Retrying Guide](./async-retrying.md) before enabling retries for operations with side effects.

## Canceling pending work and aborting active work

- `cancel()` clears a pending trailing execution. It does not stop active work or reset the current throttle interval.
- `abort()` aborts active executions. It does not clear pending trailing work.
- `flush()` runs pending trailing work immediately and returns its result.

Pass the throttler's signal to the underlying API when it supports cancellation:

```ts
const saver = useAsyncThrottler(
  async (position: number) => {
    return fetch('/api/position', {
      method: 'POST',
      body: JSON.stringify({ position }),
      signal: saver.getAbortSignal() ?? undefined,
    })
  },
  { wait: 1000 },
)

saver.abort()
```

Calling `abort()` without using the signal stops retry management but cannot force an arbitrary Promise to stop.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled timeout or guarantee that active work stops. Clean up the lifecycle first when necessary:

```ts
saver.cancel()
saver.abort()
saver.reset()
```

## Configuration

`wait` and `enabled` may be values or functions that receive the throttler instance. `setOptions()` merges new options into the existing configuration.

```ts
saver.setOptions({
  enabled: (throttler) => throttler.store.state.errorCount < 3,
  wait: (throttler) => (throttler.store.state.successCount < 10 ? 500 : 1000),
})
```

A changed `wait` value does not reschedule existing trailing work. It applies to later scheduling and executions. Disabling the throttler through `setOptions()` cancels pending trailing work.

Use `asyncThrottlerOptions()` to define reusable, type-checked option objects.

## React lifecycle

The adapter cancels pending work and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const throttler = useAsyncThrottler(
  savePositionToServer,
  { wait: 1000 },
  (state) => ({
    isPending: state.isPending,
    isExecuting: state.isExecuting,
    lastResult: state.lastResult,
  }),
)

console.log(
  throttler.state.isPending,
  throttler.state.isExecuting,
  throttler.state.lastResult,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The latest arguments retained for trailing work.
- `lastResult`: The most recent successful result.
- `lastExecutionTime` and `nextExecutionTime`: Current timing boundaries.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [React API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
