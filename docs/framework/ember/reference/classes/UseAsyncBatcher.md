---
id: UseAsyncBatcher
title: UseAsyncBatcher
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:53](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L53)

Creates an owned AsyncBatcher from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useAsyncBatcher this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `Promise`\<`any`\>\]
        \| \[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>;
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
new UseAsyncBatcher<TValue, TSelected>(owner?): UseAsyncBatcher;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncBatcher`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => Promise<any>]
      | [
          fn: (items: Array<TValue>) => Promise<any>,
          selector: (state: AsyncBatcherState<TValue>) => TSelected,
        ]
    Named: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  Return: EmberAsyncBatcher<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberAsyncBatcher<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts:73](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatcher.ts#L73)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
