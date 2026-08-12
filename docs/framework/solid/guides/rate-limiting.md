---
title: Solid Rate Limiting Guide
id: rate-limiting
---

Rate limiting allows a configured number of executions within a time window. Calls run immediately while capacity remains. Once the limit is reached, later calls are rejected until capacity becomes available again.

TanStack Pacer provides an in-memory rate limiter intended primarily for client-side operations. It can run in server-side JavaScript, but it is not a distributed quota or enforcement system.

## How rate limiting works

This example allows three executions per window:

```text
Rate Limiting (limit: 3 calls per window)
Timeline: [1 second per tick]
                                        Window 1                  | Window 2
Calls:        ⬇️     ⬇️     ⬇️     ⬇️     ⬇️                       ⬇️     ⬇️
Executed:     ✅     ✅     ✅     ❌     ❌                       ✅     ✅
             [=== 3 allowed ===][=== blocked until reset ===][=== new window ===]
```

Rate limiting permits bursts. It does not space accepted calls evenly.

## When to use rate limiting

Choose rate limiting when:

- A client operation should follow a fixed quota.
- Calls may run immediately until the quota is exhausted.
- Rejected calls may be discarded or handled separately.
- You need to measure remaining capacity or time until capacity returns.

Choose another utility when:

- Executions should be evenly spaced. Use [throttling](./throttling.md).
- Only the final call matters. Use [debouncing](./debouncing.md).
- Every operation must eventually run. Use [queuing](./queuing.md).
- Items should run together. Use [batching](./batching.md).
- You need Promise results, retries, or abort support. Use [async rate limiting](./async-rate-limiting.md).

## Window types

The `windowType` option controls when capacity returns.

### Fixed window

A fixed window starts when its first execution is accepted. All accepted executions remain counted until that window ends. Capacity then resets together.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'fixed',
})
```

Fixed windows can allow bursts near a boundary because a full quota becomes available when the window resets.

### Sliding window

A sliding window tracks each accepted execution separately. Capacity returns one execution at a time as old timestamps leave the window.

```text
Sliding Window (limit: 3 calls per window)
Timeline: [1 second per tick]
Calls:        ⬇️     ⬇️     ⬇️     ⬇️           ⬇️
Executed:     ✅     ✅     ✅     ❌           ✅
             [=== full ===][oldest execution expires][=== one available ===]
```

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 3,
  window: 1000,
  windowType: 'sliding',
})
```

Use a sliding window when capacity should return gradually rather than all at once.

## Choose an API

- `createRateLimitedSignal` or `createRateLimitedValue` for quota-controlled values
- `createRateLimiter` for callbacks, capacity helpers, and selected state

Use the signal or value API for quota-controlled reactive state. Use `createRateLimiter` for operations, capacity helpers, or rejection state.

## Solid example

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'

const limiter = createRateLimiter(
  sendEvent,
  { limit: 3, window: 10_000 },
  (state) => ({
    rejectionCount: state.rejectionCount,
  }),
)

const accepted = limiter.maybeExecute('clicked')
console.log(accepted, limiter.state().rejectionCount)
```

The focused snippets later in this guide use `createRateLimiter` and assume they run inside a Solid reactive owner.

## Handling rejected calls

Rejected calls do not run later. Use the boolean return value or `onReject` to provide feedback, retry elsewhere, or place work into a queue.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 2,
  window: 1000,
  onReject: (limiter) => {
    console.log('Rejected calls:', limiter.store.state.rejectionCount)
  },
})
```

If rejected operations must eventually run, a [queuer](./queuing.md) is usually a better fit.

## Inspecting capacity

The instance API provides two computed helpers:

```ts
limiter.getRemainingInWindow() // Accepted executions still available.
limiter.getMsUntilNextWindow() // Time until at least one execution is available.
```

Both helpers use the current `limit`, `window`, `windowType`, and execution history.

## Resetting and configuring the limiter

`reset()` clears execution timestamps, counters, and cleanup timers. The next call starts with full capacity.

```ts
limiter.reset()
```

Use `setOptions()` to update the configuration:

```ts
limiter.setOptions({
  limit: 10,
  window: 30_000,
})
```

Changing options does not erase existing execution history. Call `reset()` when the new configuration should begin with a fresh window.

The `enabled`, `limit`, and `window` options may be functions that receive the limiter instance:

```ts
const limiter = createRateLimiter(sendEvent, {
  enabled: (limiter) => limiter.store.state.executionCount < 100,
  limit: (limiter) => (limiter.store.state.rejectionCount > 10 ? 2 : 5),
  window: 60_000,
})
```

Disabling the limiter prevents the wrapped function from executing. It does not delete existing execution history.

### Observing executions

`onExecute` receives the executed arguments and limiter instance. `onReject` receives the limiter instance.

```ts
const limiter = createRateLimiter(sendEvent, {
  limit: 5,
  window: 1000,
  onExecute: (args, limiter) => {
    console.log('Sent:', args)
    console.log('Remaining:', limiter.getRemainingInWindow())
  },
  onReject: (limiter) => {
    console.log('Rejected:', limiter.store.state.rejectionCount)
  },
})
```

## Solid lifecycle

The adapter has no default operation cleanup because a synchronous limiter has no pending or active work. Use `onUnmount` only when the component needs custom teardown related to the limiter.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const limiter = createRateLimiter(
  sendEvent,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(limiter.state().isExceeded, limiter.state().rejectionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `executionCount`: Total accepted executions that completed.
- `executionTimes`: Timestamps currently used for window calculations.
- `isExceeded`: Whether the current limit has been reached.
- `rejectionCount`: Calls rejected because the window was full.
- `status`: `'disabled'`, `'exceeded'`, or `'idle'`.

See the [Solid API reference](../reference/index.md) for adapter signatures and the public core reference for complete option and state types.
