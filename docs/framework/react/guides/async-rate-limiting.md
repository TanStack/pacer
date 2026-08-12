---
title: React Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## React example

```tsx
import { useAsyncRateLimiter } from '@tanstack/react-pacer'

function LoadButton() {
  const limiter = useAsyncRateLimiter(
    loadUser,
    { limit: 3, window: 10_000 },
    (state) => ({
      rejectionCount: state.rejectionCount,
      isExecuting: state.isExecuting,
    }),
  )

  return (
    <button onClick={() => void limiter.maybeExecute('123')}>
      Load ({limiter.state.rejectionCount} rejected)
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncRateLimiter` and assume they run inside a component or another hook.

## Accepted and rejected calls

`maybeExecute()` returns a Promise with two normal outcomes:

- An accepted call executes the function and resolves with its result.
- A call rejected by the window does not execute the function and resolves with `undefined`.

Use `onReject` or compare capacity before calling when `undefined` is also a valid function result.

```ts
if (limiter.getRemainingInWindow() > 0) {
  const result = await limiter.maybeExecute('123')
}
```

Unlike the synchronous limiter, accepted calls can overlap. `limit` controls how many executions may start in the window, not how many may be active at once:

```text
limit: 3

start A ───────────────── finish A
  start B ───── finish B
    start C ─────────────────── finish C
      call D rejected
```

Use an [Async Queue](./async-queuing.md) when you need a concurrency limit or need excess work to wait instead of being rejected.

## Window behavior

The window types match the synchronous limiter:

- `fixed` starts a window with the first accepted execution. All timestamps in that window expire together.
- `sliding` keeps each accepted timestamp until its own `window` duration has elapsed.

The default is `fixed`. `getRemainingInWindow()` reports available starts, and `getMsUntilNextWindow()` reports how long a rejected caller must wait for capacity.

An accepted execution consumes capacity when it starts. It still counts if the async function later fails or is aborted. Retries for that accepted execution do not add more rate-limit timestamps.

## Errors and callbacks

Async rate limiters provide callbacks for each outcome:

- `onSuccess(result, args, limiter)` runs after an accepted execution succeeds.
- `onError(error, args, limiter)` runs after its retries fail.
- `onSettled(args, limiter)` runs after either execution outcome.
- `onReject(args, limiter)` runs when the window has no capacity.

Rejection is not an execution error. It does not call `onError` or `onSettled`.

Without `onError`, `throwOnError` defaults to `true`, so a failed accepted execution rejects its Promise. Providing `onError` changes that default to `false`; the Promise then resolves with the current `lastResult`. Set `throwOnError` explicitly when you want different behavior.

## Retrying accepted executions

Configure retries for each accepted execution with `asyncRetryerOptions`:

```ts
const limiter = useAsyncRateLimiter(sendRequest, {
  limit: 5,
  window: 60_000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 1000,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt. One accepted rate-limit slot may therefore produce multiple attempts against the downstream service. Account for that service's own limits before combining rate limiting and retries. See the [Async Retrying Guide](./async-retrying.md) for retry safety.

## Aborting active work

`abort()` aborts all active executions. It does not remove their timestamps or restore window capacity. Pass each execution's signal to the underlying operation for cancellation to propagate:

```ts
const limiter = useAsyncRateLimiter(
  async (id: string) => {
    return fetch(`/api/users/${id}`, {
      signal: limiter.getAbortSignal() ?? undefined,
    })
  },
  { limit: 5, window: 60_000 },
)

limiter.abort()
```

When several executions overlap, `getAbortSignal()` without an argument refers to the most recently started execution. Pass its `maybeExecuteCount` to target a specific active execution.

### Resetting

`reset()` clears the rate-limit timestamps and restores default state. It does not guarantee that active underlying work stops, so abort first when a full cleanup is required:

```ts
limiter.abort()
limiter.reset()
```

Resetting restores capacity immediately. Only do this when starting a genuinely new limiting period, not as a way to bypass the configured limit.

## Configuration

`enabled`, `limit`, and `window` may be values or functions that receive the limiter instance. `setOptions()` merges new options into the current configuration.

```ts
limiter.setOptions({
  enabled: (limiter) => limiter.store.state.errorCount < 3,
  limit: (limiter) => (limiter.store.state.rejectionCount > 10 ? 2 : 5),
})
```

Changing `limit`, `window`, or `windowType` does not erase existing execution history. Call `reset()` if a new configuration should begin with a fresh window. A disabled limiter does not execute the function or consume capacity; its calls resolve with `undefined`.

Use `asyncRateLimiterOptions()` to define reusable, type-checked option objects.

## React lifecycle

The adapter aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must call `abort()` when active work should still be stopped.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const limiter = useAsyncRateLimiter(
  loadUserFromApi,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    isExecuting: state.isExecuting,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(
  limiter.state.isExceeded,
  limiter.state.isExecuting,
  limiter.state.rejectionCount,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

- `executionTimes`: Accepted start times still used by the window.
- `isExceeded`: Whether the current limit has been reached.
- `isExecuting`: Whether at least one accepted execution is active.
- `rejectionCount`: Calls rejected by the window.
- `lastResult`: The most recent successful result.
- `successCount`, `errorCount`, and `settleCount`: Execution outcome counts.

See the [React API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
