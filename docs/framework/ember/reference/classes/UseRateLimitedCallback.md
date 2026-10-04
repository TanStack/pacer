---
id: UseRateLimitedCallback
title: UseRateLimitedCallback
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts:51](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts#L51)

Returns a stable rate-limited callback owned by the Ember lifecycle.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns the bound maybeExecute method with the wrapped function's parameter types. It returns an accepted-or-rejected boolean.

## State and ownership

Use useRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.

Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

## Example

```gts
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedCallback } from '@tanstack/ember-pacer'

// Inside a component template:
<template>
{{#let (useRateLimitedCallback @process limit=3 window=1000) as |schedule|}}
  <button {{on "click" (fn schedule 1)}}>Schedule</button>
{{/let}}
</template>
```

## See

useRateLimiter

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberRateLimiter`](../interfaces/EmberRateLimiter.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseRateLimitedCallback<TFn, TSelected>(owner?): UseRateLimitedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseRateLimitedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberRateLimiter<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => boolean;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedCallback.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): boolean;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`boolean`

##### Example

```ts
const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return true
rateLimiter.maybeExecute('arg1', 'arg2'); // true

// Additional calls within the window will return false
rateLimiter.maybeExecute('arg1', 'arg2'); // false
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
