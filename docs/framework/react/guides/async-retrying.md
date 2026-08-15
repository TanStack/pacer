---
title: React Async Retrying Guide
id: async-retrying
---

Retrying runs an async operation again after it fails. It can make transient failures less visible to users, but it can also repeat side effects and increase load on an unhealthy service.

> [!NOTE]
> `AsyncRetryer` is an alpha API and may change before 1.0. Its current design also supports the retry behavior inside Pacer's other async utilities.

Retrying is the exception among these framework guides: TanStack Pacer does not provide a React-specific retry primitive. The adapter re-exports the public `asyncRetry` function and `AsyncRetryer` class, so this guide uses those APIs and connects long-lived instances to the React lifecycle.

If TanStack Query already owns the request, use its retry support so one system controls request state and cancellation.

## Decide whether retrying is safe

Retry only errors that are likely to succeed later, such as a temporary network failure, a rate-limit response, or some server errors. Validation, authentication, permission, and most other client errors usually need a code or user-input change instead.

`AsyncRetryer` retries every thrown error. It does not provide a `shouldRetry` predicate. Make the wrapped function throw only for retriable outcomes:

```ts
async function loadUser(id: string) {
  const response = await fetch(`/api/users/${id}`)

  if (response.status === 429 || response.status >= 500) {
    throw new Error(`Temporary failure: ${response.status}`)
  }

  if (!response.ok) {
    return { ok: false as const, status: response.status }
  }

  return { ok: true as const, user: await response.json() }
}
```

Also consider whether repeating the operation is idempotent. Reads are commonly safe. Writes may create duplicate records, charges, messages, or other side effects when the first response is lost after the server completes the operation. Use idempotency keys or server-side deduplication before retrying such writes.

## Quick start

`asyncRetry` creates one retryer and returns its bound execution function:

```ts
import { asyncRetry } from '@tanstack/react-pacer'

const loadUserWithRetry = asyncRetry(loadUser, {
  maxAttempts: 3,
  baseWait: 1000,
  jitter: 0.2,
})

try {
  const result = await loadUserWithRetry('123')
  console.log(result)
} catch (error) {
  console.error('All attempts failed:', error)
}
```

The defaults are three total attempts, exponential backoff from 1000 milliseconds, no maximum delay, no jitter, and `throwOnError: 'last'`.

The returned function can be reused sequentially. It owns one `AsyncRetryer`, so starting a new call while an earlier call is active aborts the earlier retry flow. When calls may overlap, create a retryer per call or use another utility that manages concurrency:

```ts
import { AsyncRetryer } from '@tanstack/react-pacer'

async function loadOneUser(id: string) {
  const retryer = new AsyncRetryer(loadUser, { maxAttempts: 3 })
  return retryer.execute(id)
}
```

## Create one retryer per component

```tsx
import { useEffect, useMemo } from 'react'
import { AsyncRetryer } from '@tanstack/react-pacer'

function UserPanel({ id }: { id: string }) {
  const retryer = useMemo(
    () =>
      new AsyncRetryer(loadUser, {
        maxAttempts: 3,
        baseWait: 1000,
        jitter: 0.2,
        backoff: 'exponential',
        maxWait: 5000,
        onRetry: (attempt, error) => {
          console.log(`Attempt ${attempt} failed; retrying`, error)
        },
        onLastError: (error) => {
          console.error('Attempts exhausted:', error)
        },
      }),
    [],
  )

  useEffect(() => () => retryer.abort(), [retryer])

  return <button onClick={() => void retryer.execute(id)}>Reload</button>
}
```

Update `retryer.fn` when the function closes over changing props or state. Starting a second `execute()` on the same instance aborts its earlier retry flow. Create separate instances when executions may overlap.

Use a long-lived `AsyncRetryer` when you need callbacks, state, changing options, or manual abort control. `maxAttempts` includes the first call. A value of `1` disables retries while retaining result, error, timeout, callback, and abort behavior.

## Attempts and backoff

The first attempt starts immediately. A delay is calculated only after a failed attempt that has another attempt available.

With `baseWait: 1000`, the nominal delays are:

| Failed attempt | Exponential |  Linear |   Fixed |
| -------------- | ----------: | ------: | ------: |
| 1              |     1000 ms | 1000 ms | 1000 ms |
| 2              |     2000 ms | 2000 ms | 1000 ms |
| 3              |     4000 ms | 3000 ms | 1000 ms |
| 4              |     8000 ms | 4000 ms | 1000 ms |

`maxWait` caps the nominal delay before jitter. `baseWait`, `maxWait`, and `maxAttempts` can also be functions that receive the retryer instance.

### Add jitter for shared services

Many clients can fail at the same time and otherwise retry in synchronized waves. `jitter` adds random variation above or below each nominal delay:

```ts
const retryer = new AsyncRetryer(loadUser, {
  maxAttempts: 4,
  baseWait: 1000,
  maxWait: 10_000,
  jitter: 0.25,
})
```

Use a value from `0` to `1`, where `0.25` allows up to 25 percent variation. Because jitter is applied after `maxWait`, the final randomized delay can be slightly greater than `maxWait`.

## Errors and callbacks

The error callbacks serve different levels of the retry lifecycle:

- `onError(error, args, retryer)` runs for every failed attempt.
- `onRetry(attempt, error, retryer)` runs after a failed attempt when another attempt remains. `attempt` is the number that just failed.
- `onLastError(error, retryer)` runs after all attempts fail.
- `onSuccess(result, args, retryer)` runs once after a successful attempt.
- `onSettled(args, retryer)` runs as attempts settle.

`throwOnError` controls the final failed result:

- `'last'`, the default, rejects with the final error after all attempts fail.
- `true` also runs the configured attempts, then rejects with the final error.
- `false` resolves with `undefined` after all attempts fail.

Providing `onError` changes the default `throwOnError` value to `false`. Set it explicitly if you want both observation and rejection:

```ts
const retryer = new AsyncRetryer(loadUser, {
  onError: (error) => reportError(error),
  throwOnError: 'last',
})
```

An `AbortError` thrown by the wrapped function is treated as cancellation. It resolves with `undefined` without consuming further attempts or calling `onAbort` automatically.

## Timeouts

Two independent options limit retry work:

- `maxExecutionTime` sets a deadline for one attempt.
- `maxTotalExecutionTime` sets a deadline for the complete call, including attempts and backoff waits.

```ts
const retryer = new AsyncRetryer(loadUser, {
  maxAttempts: 4,
  maxExecutionTime: 5000,
  maxTotalExecutionTime: 15_000,
  onExecutionTimeout: () => console.warn('Attempt timed out'),
  onTotalExecutionTimeout: () => console.warn('Retry operation timed out'),
})
```

A timeout aborts the retry flow. `onAbort` receives either `'execution-timeout'` or `'total-timeout'`. A total timeout normally resolves with `undefined`. A per-attempt timeout can reject with its final timeout or abort error when `throwOnError` is enabled, and resolves with `undefined` when error throwing is disabled.

JavaScript cannot forcibly stop an arbitrary Promise. A timeout prevents Pacer from continuing the retry flow, but the underlying operation stops only if it cooperates with the abort signal.

## Aborting the underlying operation

Call `getAbortSignal()` from the wrapped function and pass the signal to an API that supports it:

```ts
const retryer = new AsyncRetryer(
  async (url: string) => {
    const response = await fetch(url, {
      signal: retryer.getAbortSignal() ?? undefined,
    })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return response.json()
  },
  { maxAttempts: 3 },
)

const request = retryer.execute('/api/data')
retryer.abort()
await request // undefined
```

`abort()` stops the active retry flow and pending backoff. `onAbort` receives `'manual'`. Starting another `execute()` on the same instance aborts the earlier flow with `'new-execution'`.

Without passing the signal to the operation, `abort()` prevents later retry work but the active Promise may continue running in the background.

## Resetting and changing options

`setOptions()` merges new options into the current configuration. It does not restart an active execution.

`reset()` restores default state only. It does not abort active work:

```ts
retryer.abort()
retryer.reset()
```

Use `asyncRetryerOptions()` to define reusable, type-checked option objects:

```ts
const networkRetryOptions = asyncRetryerOptions({
  maxAttempts: 3,
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.2,
})
```

## State

The retryer stores state at `retryer.store`.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Commonly useful properties include:

- `currentAttempt`: The current or most recently started attempt number. It returns to `0` after success or reset.
- `isExecuting`: Whether a retry flow is active.
- `lastError`: The most recent failed attempt's error.
- `lastResult`: The most recent successful result.
- `executionCount`: Successful top-level executions, not individual attempts.
- `lastExecutionTime` and `totalExecutionTime`: Timing recorded for the most recent success.
- `status`: `'disabled'`, `'idle'`, `'executing'`, or `'retrying'`.

`AsyncRetryer` does not expose a React state selector. Use its callbacks to copy the fields needed by the view into React state. If you subscribe to `retryer.store` directly, register the unsubscribe function with the same component or owner cleanup that aborts the retryer.

For exact signatures, see the [`asyncRetry` function reference](../../../reference/functions/asyncRetry.md), [`AsyncRetryer` class reference](../../../reference/classes/AsyncRetryer.md), and [`AsyncRetryerOptions` reference](../../../reference/interfaces/AsyncRetryerOptions.md).

## Related docs

- [React adapter](../adapter.md)
- [Choose a Pacer utility](../../../guides/which-pacer-utility-should-i-choose.md)
- [Select another framework](../../../guides/async-retrying.md)
