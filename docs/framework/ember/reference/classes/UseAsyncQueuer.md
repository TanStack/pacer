---
id: UseAsyncQueuer
title: UseAsyncQueuer
---

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:106](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L106)

Creates and retains the AsyncQueuer for its Ember owner.

Retains items until they are processed. Use addItem to enqueue work and start, stop, execute, clear, or flush to control processing. Selected state exposes pending items, capacity, and completed work.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

Available state fields:

- `activeItems`: Items currently being processed by the queuer
- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `errorCount`: Number of task executions that have resulted in errors
- `executionCount`: Number of times execute has been called
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isExecuting`: Whether the queuer is currently executing
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `lastResult`: The result from the most recent task execution
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `settleCount`: Number of task executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the queue
- `status`: Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused
- `successCount`: Number of task executions that have completed successfully

## Options and ownership

Tracked named arguments update options after rendering. createPacerScope supplies shared
defaults through contextual helpers. Local named options override those defaults.
Removing the helper invocation calls stop() and abort().
onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
must perform all required cleanup. Use flush() where supported to finish pending work.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncQueuer } from '@tanstack/ember-pacer'
import type { AsyncQueuerState } from '@tanstack/ember-pacer'

const select = (state: AsyncQueuerState<string>) => ({ size: state.size })

<template>
  {{#let (useAsyncQueuer @process select wait=100) as |utility|}}
    <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
    <span>{{utility.state.size}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncQueuerOptions`](../interfaces/EmberAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`item`) => `Promise`\<`any`\>\]
        \| \[(`item`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncQueuer`](../interfaces/EmberAsyncQueuer.md)\<`TValue`, `TSelected`\>;
\}\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseAsyncQueuer<TValue, TSelected>(owner?): UseAsyncQueuer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncQueuer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => Promise<any>]
      | [
          fn: (item: TValue) => Promise<any>,
          selector: (state: AsyncQueuerState<TValue>) => TSelected,
        ]
    Named: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  Return: EmberAsyncQueuer<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncQueuer<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:126](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L126)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`item`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncQueuerOptions`](../interfaces/EmberAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberAsyncQueuer`](../interfaces/EmberAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
