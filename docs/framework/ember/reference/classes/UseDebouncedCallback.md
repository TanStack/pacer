---
id: UseDebouncedCallback
title: UseDebouncedCallback
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedCallback.ts:48](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedCallback.ts#L48)

Returns a stable debounced callback owned by the Ember lifecycle.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use useDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useDebouncedCallback @process wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useDebouncer

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncer`](../interfaces/EmberDebouncer.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseDebouncedCallback<TFn, TSelected>(owner?): UseDebouncedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: DebouncerState<TFn>) => TSelected]
    Named: EmberDebouncerOptions<TFn, TSelected>
  }
  Return: EmberDebouncer<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => void;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedCallback.ts:64](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedCallback.ts#L64)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): void;
```

Attempts to execute the debounced function
If a call is already in progress, it will be queued

##### Parameters

###### args

...`Parameters`\<`TFn`\>

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
