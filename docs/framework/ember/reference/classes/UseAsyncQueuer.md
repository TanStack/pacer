---
id: UseAsyncQueuer
title: UseAsyncQueuer
---

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:53](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L53)

Creates an owned AsyncQueuer from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useAsyncQueuer this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncQueuerOptions`](../interfaces/EmberAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`item`) => `Promise`\<`any`\>\]
        \| \[(`item`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncQueuer`](../interfaces/EmberAsyncQueuer.md)\<`TValue`, `TSelected`\>;
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
new UseAsyncQueuer<TValue, TSelected>(owner?): UseAsyncQueuer;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncQueuer`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => Promise<any>]
      | [
          fn: (item: TValue) => Promise<any>,
          selector: (state: AsyncQueuerState<TValue>) => TSelected,
        ]
    Named: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  Return: EmberAsyncQueuer<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncQueuer<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:73](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L73)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`item`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncQueuerOptions`](../interfaces/EmberAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberAsyncQueuer`](../interfaces/EmberAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
