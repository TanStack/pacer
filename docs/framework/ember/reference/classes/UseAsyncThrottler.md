---
id: UseAsyncThrottler
title: UseAsyncThrottler
---

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:54](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L54)

Creates an owned AsyncThrottler from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useAsyncThrottler this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncThrottlerOptions`](../interfaces/EmberAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncThrottler`](../interfaces/EmberAsyncThrottler.md)\<`TFn`, `TSelected`\>;
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
new UseAsyncThrottler<TFn, TSelected>(owner?): UseAsyncThrottler;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncThrottler`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncThrottlerState<TFn>) => TSelected]
    Named: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  Return: EmberAsyncThrottler<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncThrottler<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts:74](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-throttler/useAsyncThrottler.ts#L74)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncThrottlerOptions`](../interfaces/EmberAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberAsyncThrottler`](../interfaces/EmberAsyncThrottler.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
