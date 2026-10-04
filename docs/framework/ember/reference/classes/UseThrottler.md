---
id: UseThrottler
title: UseThrottler
---

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:51](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L51)

Creates an owned Throttler from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useThrottler this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>;
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
new UseThrottler<TFn, TSelected>(owner?): UseThrottler;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottler`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: ThrottlerState<TFn>) => TSelected]
    Named: EmberThrottlerOptions<TFn, TSelected>
  }
  Return: EmberThrottler<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberThrottler<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottler.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottler.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberThrottler`](../interfaces/EmberThrottler.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
