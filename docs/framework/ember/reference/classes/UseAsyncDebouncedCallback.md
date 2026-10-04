---
id: UseAsyncDebouncedCallback
title: UseAsyncDebouncedCallback
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts:51](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts#L51)

Returns a stable debounced callback owned by the Ember lifecycle.

With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.

## State and ownership

Use useAsyncDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncedCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useAsyncDebouncedCallback @process wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useAsyncDebouncer

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseAsyncDebouncedCallback<TFn, TSelected>(owner?): UseAsyncDebouncedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncDebouncedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts:71](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts#L71)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the debounced function.
If a call is already in progress, it will be queued.

Error Handling:
- If the debounced function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

##### Throws

The error from the debounced function if no onError handler is configured

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
