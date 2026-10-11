---
id: UseAsyncBatcher
title: UseAsyncBatcher
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:100](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L100)

Creates and retains the AsyncBatcher for its Ember owner.

Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.

The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
Use onSuccess, onError, and onSettled for execution outcomes.

## State and subscriptions

Pass a selector to track only the state consumed by the owner. The default selection is {},
so utility state changes do not update the owner unless it opts in. Selection uses shallow
comparison. The raw store remains available for additional subscriptions.
The selector is the second positional argument. Read utility.state from the template.
The contextual utility.Subscribe helper selects state for a child template.

Available state fields:

- `errorCount`: Number of batch executions that have resulted in errors
- `executionCount`: Number of batch executions that have been started
- `failedItems`: Array of items that failed during batch processing
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isExecuting`: Whether a batch is currently being processed asynchronously
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `lastResult`: The result from the most recent batch execution
- `settleCount`: Number of batch executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the batch queue
- `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout, 'executing' when processing, 'populated' when items are present, but no wait is configured
- `successCount`: Number of batch executions that have completed successfully
- `totalItemsFailed`: Total number of items that have failed processing across all batches
- `totalItemsProcessed`: Total number of items that have been processed across all batches

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
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type { AsyncBatcherState } from '@tanstack/ember-pacer'

const select = (state: AsyncBatcherState<string>) => ({ size: state.size })

<template>
  {{#let (useAsyncBatcher @process select maxSize=5 wait=1000) as |utility|}}
    <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
    <span>{{utility.state.size}}</span>
  {{/let}}
</template>
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `Promise`\<`any`\>\]
        \| \[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>;
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
new UseAsyncBatcher<TValue, TSelected>(owner?): UseAsyncBatcher;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncBatcher`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => Promise<any>]
      | [
          fn: (items: Array<TValue>) => Promise<any>,
          selector: (state: AsyncBatcherState<TValue>) => TSelected,
        ]
    Named: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  Return: EmberAsyncBatcher<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncBatcher<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:120](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L120)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
