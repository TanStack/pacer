---
id: UseAsyncRateLimiter
title: UseAsyncRateLimiter
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:97](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L97)

Creates and retains the AsyncRateLimiter for its Ember owner.

Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

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

Tracked named arguments update options after rendering. createPacerScope supplies shared
defaults through contextual helpers. Local named options override those defaults.
Removing the helper invocation calls abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncRateLimiter } from '@tanstack/ember-pacer'
import type { AsyncRateLimiterState } from '@tanstack/ember-pacer'

const select = (state: AsyncRateLimiterState<(value: string) => Promise<void>>) => ({ executionCount: state.executionCount })

<template>
  {{#let (useAsyncRateLimiter @process select limit=5 window=1000) as |utility|}}
    <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
    <span>{{utility.state.executionCount}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncRateLimiter`](../interfaces/EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>;
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseAsyncRateLimiter<TFn, TSelected>(owner?): UseAsyncRateLimiter;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncRateLimiter`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncRateLimiterState<TFn>) => TSelected]
    Named: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberAsyncRateLimiter<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:117](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L117)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberAsyncRateLimiter`](../interfaces/EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
