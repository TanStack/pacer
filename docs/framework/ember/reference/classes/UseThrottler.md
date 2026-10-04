---
id: UseThrottler
title: UseThrottler
---

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:88](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L88)

Creates and retains the Throttler for its Ember owner.

Limits execution to at most one call per wait interval. Leading and trailing options control immediate and deferred execution; the trailing call uses the latest arguments.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

Available state fields:

- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting for timeout

## Options and ownership

Tracked named arguments update options after rendering. createPacerScope supplies shared
defaults through contextual helpers. Local named options override those defaults.
Removing the helper invocation calls cancel().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type { ThrottlerState } from '@tanstack/ember-pacer'

const select = (state: ThrottlerState<(value: string) => void>) => ({ isPending: state.isPending })

<template>
  {{#let (useThrottler @process select wait=500) as |utility|}}
    <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
    <span>{{utility.state.isPending}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>;
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseThrottler<TFn, TSelected>(owner?): UseThrottler;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottler`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: ThrottlerState<TFn>) => TSelected]
    Named: EmberThrottlerOptions<TFn, TSelected>
  }
  Return: EmberThrottler<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberThrottler<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:104](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L104)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
