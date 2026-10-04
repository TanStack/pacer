---
id: UseAsyncDebouncer
title: UseAsyncDebouncer
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:54](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L54)

Creates an owned AsyncDebouncer from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useAsyncDebouncer this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>;
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
new UseAsyncDebouncer<TFn, TSelected>(owner?): UseAsyncDebouncer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncDebouncer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncDebouncer<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts:74](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncer.ts#L74)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
