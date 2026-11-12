---
id: UseBatcher
title: UseBatcher
---

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:84](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L84)

Creates and retains the Batcher for its Ember owner.

Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

Available state fields:

- `executionCount`: Number of batch executions that have been completed
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `size`: Number of items currently in the batch queue
- `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout
- `totalItemsProcessed`: Total number of items that have been processed across all batches

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
import { useBatcher } from '@tanstack/ember-pacer'
import type { BatcherState } from '@tanstack/ember-pacer'

const select = (state: BatcherState<string>) => ({ size: state.size })

<template>
  {{#let (useBatcher @process select maxSize=5 wait=1000) as |utility|}}
    <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
    <span>{{utility.state.size}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `void`\]
        \| \[(`items`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>;
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
new UseBatcher<TValue, TSelected>(owner?): UseBatcher;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseBatcher`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => void]
      | [
          fn: (items: Array<TValue>) => void,
          selector: (state: BatcherState<TValue>) => TSelected,
        ]
    Named: EmberBatcherOptions<TValue, TSelected>
  }
  Return: EmberBatcher<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberBatcher<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:104](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L104)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
