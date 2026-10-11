---
id: createRateLimiter
title: createRateLimiter
---

```ts
function createRateLimiter<TFn, TSelected>(
   scope,
   fn,
   options,
selector?): AlpineRateLimiter<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:87](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L87)

Creates and retains the RateLimiter for its Alpine owner.

Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Use utility.subscribe(childScope, selector) for a child subscription. It returns a getter
and cleans up with the child without canceling the parent utility.

Available state fields:

- `executionCount`: Number of function executions that have been completed
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExceeded`: Whether the rate limiter has exceeded the limit
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
The synchronous rate limiter has no pending timer to cancel during teardown.
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

Owner of option updates, subscriptions, and cleanup.

### fn

`TFn`

Function executed by the utility.

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { createRateLimiter } from '@tanstack/alpine-pacer'

const utility = createRateLimiter(
  scope, (value: string) => { console.log(value) },
  { limit: 5, window: 1000 },
  (state) => ({ executionCount: state.executionCount }),
)
utility.maybeExecute('item')
// Selected state: utility.state.executionCount
```
