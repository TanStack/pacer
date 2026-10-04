---
id: UseAsyncRateLimiter
title: UseAsyncRateLimiter
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:54](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L54)

Creates an owned AsyncRateLimiter from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useAsyncRateLimiter this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncRateLimiter`](../interfaces/EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>;
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
new UseAsyncRateLimiter<TFn, TSelected>(owner?): UseAsyncRateLimiter;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncRateLimiter`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncRateLimiterState<TFn>) => TSelected]
    Named: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberAsyncRateLimiter<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:74](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L74)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberAsyncRateLimiter`](../interfaces/EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
