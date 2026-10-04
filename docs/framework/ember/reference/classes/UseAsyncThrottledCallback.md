---
id: UseAsyncThrottledCallback
title: UseAsyncThrottledCallback
---

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottledCallback.ts:51](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottledCallback.ts#L51)

Returns a stable throttled callback owned by the Ember lifecycle.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.

## State and ownership

Use useAsyncThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncThrottledCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useAsyncThrottledCallback @process wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useAsyncThrottler

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncThrottlerOptions`](../interfaces/EmberAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncThrottler`](../interfaces/EmberAsyncThrottler.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseAsyncThrottledCallback<TFn, TSelected>(owner?): UseAsyncThrottledCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncThrottledCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncThrottlerState<TFn>) => TSelected]
    Named: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  Return: EmberAsyncThrottler<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottledCallback.ts:71](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottledCallback.ts#L71)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncThrottlerOptions`](../interfaces/EmberAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the throttled function. The execution behavior depends on the throttler options:

- If enough time has passed since the last execution (>= wait period):
  - With leading=true: Executes immediately
  - With leading=false: Waits for the next trailing execution

- If within the wait period:
  - With trailing=true: Schedules execution for end of wait period
  - With trailing=false: Drops the execution

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

##### Example

```ts
const throttled = new AsyncThrottler(fn, { wait: 1000 });

// First call executes immediately
await throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
await throttled.maybeExecute('c', 'd');
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
