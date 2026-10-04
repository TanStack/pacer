---
id: useAsyncRateLimiter
title: useAsyncRateLimiter
---

```ts
function useAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): VueAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:93](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L93)

Creates and retains the AsyncRateLimiter for its Vue owner.

Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
Read selected state through utility.state.value in JavaScript. Vue templates unwrap refs.
Use utility.Subscribe with a scoped slot to select state in a child without updating the owner.

Available state fields:

- `errorCount`: Number of function executions that have resulted in errors
- `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
- `isExceeded`: Whether the rate limiter has exceeded the limit
- `isExecuting`: Whether the rate-limited function is currently executing asynchronously
- `lastResult`: The result from the most recent successful function execution
- `rejectionCount`: Number of function executions that have been rejected due to rate limiting
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
- `successCount`: Number of function executions that have completed successfully
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)

## Options and ownership

Pass an options object with property getters or a factory. Top-level properties are read
reactively; function-valued core options remain callbacks. Local options override provider
defaults. Updates retain the utility, its store, counters, and pending work.
Disposing the component or effect scope calls abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

Function executed by the utility.

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueAsyncRateLimiterOptions`](../interfaces/VueAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

Core options or a reactive factory, plus an optional onUnmount callback.

### selector?

(`state`) => `TSelected`

Selects state that updates the owner. Omit to leave selected state empty.

## Returns

[`VueAsyncRateLimiter`](../interfaces/VueAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

The retained utility instance with selected state and child subscriptions.

## Example

```ts
import { useAsyncRateLimiter } from '@tanstack/vue-pacer'

const utility = useAsyncRateLimiter(
  async (value: string) => { console.log(value) },
  { limit: 5, window: 1000 },
  (state) => ({ executionCount: state.executionCount }),
)
utility.maybeExecute('item')
// Selected state: utility.state.value.executionCount
```
