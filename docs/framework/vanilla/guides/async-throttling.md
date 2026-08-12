---
title: Vanilla Async Throttling Guide
id: async-throttling
---

Async throttling keeps the timing behavior described in the [Throttling Guide](./throttling.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when a throttled operation returns a value you need, can reject, or needs retry and abort support. A synchronous `Throttler` can invoke an async function as a side effect, but it does not manage the resulting Promise.

## Quick start

Use `asyncThrottle` when you only need a callable function:

```ts
import { asyncThrottle } from '@tanstack/pacer'

const savePosition = asyncThrottle(
  async (position: number) => {
    const response = await fetch('/api/position', {
      method: 'POST',
      body: JSON.stringify({ position }),
    })
    if (!response.ok) throw new Error('Save failed')
    return response.json()
  },
  { wait: 1000 },
)

const result = await savePosition(42)
```

Use `AsyncThrottler` when you need methods, state, or callbacks:

```ts
import { AsyncThrottler } from '@tanstack/pacer'

const saver = new AsyncThrottler(savePositionToServer, {
  wait: 1000,
  onSuccess: (result, args) => {
    console.log('Saved position:', args[0], result)
  },
  onError: (error, args) => {
    console.error('Save failed:', args[0], error)
  },
})

const result = await saver.maybeExecute(42)
```

The default edge behavior is `leading: true` and `trailing: true`. The first call executes immediately. Calls during the interval update the arguments retained for one trailing execution.

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

| `leading` | `trailing` | Behavior |
| --- | --- | --- |
| `true` | `true` | Execute immediately and retain the latest call for one trailing execution. This is the default. |
| `true` | `false` | Execute immediately and discard calls made during the interval. |
| `false` | `true` | Wait one interval before the first execution, then retain the latest call in each interval. |
| `false` | `false` | Record calls without executing the function. |

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
const saver = new AsyncThrottler(savePositionToServer, {
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
const saver = new AsyncThrottler(
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
  wait: (throttler) =>
    throttler.store.state.successCount < 10 ? 500 : 1000,
})
```

A changed `wait` value does not reschedule existing trailing work. It applies to later scheduling and executions. Disabling the throttler through `setOptions()` cancels pending trailing work.

Use `asyncThrottlerOptions()` to define reusable, type-checked option objects.

## State

The class stores state at `throttler.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `isPending`: Whether a trailing execution is scheduled.
- `isExecuting`: Whether the wrapped function is active.
- `lastArgs`: The latest arguments retained for trailing work.
- `lastResult`: The most recent successful result.
- `lastExecutionTime` and `nextExecutionTime`: Current timing boundaries.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [`AsyncThrottler` API reference](../../../reference/classes/AsyncThrottler.md) for the complete state and option types.
