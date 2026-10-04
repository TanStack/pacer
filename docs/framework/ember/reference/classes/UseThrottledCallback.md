---
id: UseThrottledCallback
title: UseThrottledCallback
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledCallback.ts:48](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledCallback.ts#L48)

Returns a stable throttled callback owned by the Ember lifecycle.

Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.

## State and ownership

Use useThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useThrottledCallback @process wait=500) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useThrottler

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseThrottledCallback<TFn, TSelected>(owner?): UseThrottledCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottledCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: ThrottlerState<TFn>) => TSelected]
    Named: EmberThrottlerOptions<TFn, TSelected>
  }
  Return: EmberThrottler<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => void;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledCallback.ts:64](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledCallback.ts#L64)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): void;
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

`void`

##### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
