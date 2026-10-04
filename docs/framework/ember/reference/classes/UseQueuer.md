---
id: UseQueuer
title: UseQueuer
---

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:47](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L47)

Creates an owned Queuer from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useQueuer this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`: \[(`item`) => `void`\] \| \[(`item`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberQueuer`](../interfaces/EmberQueuer.md)\<`TValue`, `TSelected`\>;
\}\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseQueuer<TValue, TSelected>(owner?): UseQueuer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseQueuer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => void]
      | [
          fn: (item: TValue) => void,
          selector: (state: QueuerState<TValue>) => TSelected,
        ]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuer<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberQueuer<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`item`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberQueuer`](../interfaces/EmberQueuer.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
