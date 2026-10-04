---
id: UseAsyncBatchedCallback
title: UseAsyncBatchedCallback
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts:50](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts#L50)

Returns a stable batched callback owned by the Ember lifecycle.

Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.

## Return value

Returns the bound addItem method, which accepts one item per call. The returned Promise preserves the core result and error contract. An addition that only schedules a batch does not await the later batch result.

## State and ownership

Use useAsyncBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatchedCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useAsyncBatchedCallback @process maxSize=5 wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useAsyncBatcher

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `Promise`\<`any`\>\]
        \| \[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>\[`"addItem"`\];
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
new UseAsyncBatchedCallback<TValue, TSelected>(owner?): UseAsyncBatchedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncBatchedCallback`

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
  Return: EmberAsyncBatcher<TValue, TSelected>['addItem']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (item) => Promise<any>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts:70](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts#L70)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

```ts
(item): Promise<any>;
```

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

##### Throws

The error from the batch function if no onError handler is configured or throwOnError is true

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
