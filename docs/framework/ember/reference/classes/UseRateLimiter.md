---
id: UseRateLimiter
title: UseRateLimiter
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:53](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L53)

Creates an owned RateLimiter from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useRateLimiter this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberRateLimiter`](../interfaces/EmberRateLimiter.md)\<`TFn`, `TSelected`\>;
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
new UseRateLimiter<TFn, TSelected>(owner?): UseRateLimiter;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseRateLimiter`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberRateLimiter<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberRateLimiter<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:69](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L69)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberRateLimiter`](../interfaces/EmberRateLimiter.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
