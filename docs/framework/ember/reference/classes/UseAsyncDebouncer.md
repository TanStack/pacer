---
id: UseAsyncDebouncer
title: UseAsyncDebouncer
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:97](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L97)

Creates and retains the AsyncDebouncer for its Ember owner.

Waits for a quiet period, then executes the latest call. Each new call restarts the trailing timer. Configure leading and trailing edges for search, autosave, or resize handlers.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

Available state fields:

- `canLeadingExecute`: Whether the debouncer can execute on the leading edge of the timeout
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
- `successCount`: Number of function executions that have completed successfully

## Options and ownership

Tracked named arguments update options after rendering. createPacerScope supplies shared
defaults through contextual helpers. Local named options override those defaults.
Removing the helper invocation calls cancel() and abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
import type { AsyncDebouncerState } from '@tanstack/ember-pacer'

const select = (state: AsyncDebouncerState<(value: string) => Promise<void>>) => ({ isPending: state.isPending })

<template>
  {{#let (useAsyncDebouncer @process select wait=500) as |utility|}}
    <button {{on "click" (fn utility.maybeExecute "item")}}>Schedule</button>
    <span>{{utility.state.isPending}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>;
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
new UseAsyncDebouncer<TFn, TSelected>(owner?): UseAsyncDebouncer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncDebouncer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncDebouncer<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:117](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L117)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
