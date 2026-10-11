---
id: UseThrottledState
title: UseThrottledState
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledState.ts:56](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledState.ts#L56)

Creates throttled state with a scheduled setter.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledState } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useThrottledState 0 wait=500) as |result|}}
  <output>{{result.value}}</output>
  <button {{on "click" (fn result.setValue 1)}}>Update</button>
{{/let}}
</template>
```

## See

useThrottler

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottledState`](../interfaces/EmberThrottledState.md)\<`TValue`, `TSelected`\>;
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
new UseThrottledState<TValue, TSelected>(owner?): UseThrottledState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottledState`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
        ]
    Named: EmberThrottlerOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberThrottledState<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberThrottledState<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledState.ts:75](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledState.ts#L75)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>

#### Returns

[`EmberThrottledState`](../interfaces/EmberThrottledState.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
