---
id: UseQueuedValue
title: UseQueuedValue
---

Defined in: [packages/ember-pacer/src/queuer/useQueuedValue.ts:53](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedValue.ts#L53)

Derives a queued value from its current source.

Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.

## Return value

Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Pass the current tracked value as the first positional argument. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { useQueuedValue } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useQueuedValue @source wait=500) as |result|}}
  <output>{{result.value}}</output>
{{/let}}
</template>
```

## See

useQueuer

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberQueuedValue`](../interfaces/EmberQueuedValue.md)\<`TValue`, `TSelected`\>;
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
new UseQueuedValue<TValue, TSelected>(owner?): UseQueuedValue;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseQueuedValue`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: QueuerState<TValue>) => TSelected]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuedValue<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberQueuedValue<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuedValue.ts:71](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedValue.ts#L71)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberQueuedValue`](../interfaces/EmberQueuedValue.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
