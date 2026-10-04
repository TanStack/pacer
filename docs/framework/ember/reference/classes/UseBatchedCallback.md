---
id: UseBatchedCallback
title: UseBatchedCallback
---

Defined in: [packages/ember-pacer/src/batcher/useBatchedCallback.ts:47](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatchedCallback.ts#L47)

Returns a stable batched callback owned by the Ember lifecycle.

Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.

## Return value

Returns the bound addItem method, which accepts one item per call. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use useBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatchedCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useBatchedCallback @process maxSize=5 wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useBatcher

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `void`\]
        \| \[(`items`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>\[`"addItem"`\];
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
new UseBatchedCallback<TValue, TSelected>(owner?): UseBatchedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseBatchedCallback`

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
  Return: EmberBatcher<TValue, TSelected>['addItem']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (item) => void;
```

Defined in: [packages/ember-pacer/src/batcher/useBatchedCallback.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatchedCallback.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

```ts
(item): void;
```

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`void`

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
