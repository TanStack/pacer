---
id: UseDebouncer
title: UseDebouncer
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:51](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L51)

Creates an owned Debouncer from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useDebouncer this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncer`](../interfaces/EmberDebouncer.md)\<`TFn`, `TSelected`\>;
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
new UseDebouncer<TFn, TSelected>(owner?): UseDebouncer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: DebouncerState<TFn>) => TSelected]
    Named: EmberDebouncerOptions<TFn, TSelected>
  }
  Return: EmberDebouncer<TFn, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberDebouncer<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncer.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncer.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

[`EmberDebouncer`](../interfaces/EmberDebouncer.md)\<`TFn`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
