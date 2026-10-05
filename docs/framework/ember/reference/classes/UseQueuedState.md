---
id: UseQueuedState
title: UseQueuedState
---

Defined in: [packages/ember-pacer/src/queuer/useQueuedState.ts:49](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedState.ts#L49)

Exposes pending queue items together with the queue that processes them.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Yields the queue instance. Read pending items from queue.state.items and enqueue with queue.addItem().

## State and ownership

Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedState } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useQueuedState @process wait=500) as |queue|}}
  <button {{on "click" (fn queue.addItem 1)}}>Add</button>
  <output>{{queue.state.items.length}}</output>
{{/let}}
</template>
```

## See

useQueuer

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`: \[(`item`) => `void`\] \| \[(`item`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberQueuer`](../interfaces/EmberQueuer.md)\<`TValue`, `TSelected`\>;
\}\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Constructors

### Constructor

```ts
new UseQueuedState<TValue, TSelected>(owner?): UseQueuedState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseQueuedState`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => void]
      | [
          fn: (item: TValue) => void,
          selector: (state: QueuerState<TValue>) => TSelected,
        ]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuer<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberQueuer<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuedState.ts:75](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedState.ts#L75)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`item`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberQueuer`](../interfaces/EmberQueuer.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
