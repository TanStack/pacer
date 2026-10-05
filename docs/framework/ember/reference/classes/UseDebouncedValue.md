---
id: UseDebouncedValue
title: UseDebouncedValue
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:52](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L52)

Derives a debounced value from its current source.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Pass the current tracked value as the first positional argument. The initial value is available immediately. Source changes schedule updates on the existing utility.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { useDebouncedValue } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useDebouncedValue @source wait=500) as |result|}}
  <output>{{result.value}}</output>
{{/let}}
</template>
```

## See

useDebouncer

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<(`value`) => `void`, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncedValue`](../interfaces/EmberDebouncedValue.md)\<`TValue`, `TSelected`\>;
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
new UseDebouncedValue<TValue, TSelected>(owner?): UseDebouncedValue;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncedValue`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (
            state: DebouncerState<(value: TValue) => void>,
          ) => TSelected,
        ]
    Named: EmberDebouncerOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberDebouncedValue<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberDebouncedValue<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:76](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L76)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<(`value`) => `void`, `TSelected`\>

#### Returns

[`EmberDebouncedValue`](../interfaces/EmberDebouncedValue.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
