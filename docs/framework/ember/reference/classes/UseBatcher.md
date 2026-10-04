---
id: UseBatcher
title: UseBatcher
---

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:47](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L47)

Creates an owned Batcher from an Ember template.

Positional arguments are the execution function and an optional state selector.
Named arguments are core options and onUnmount. Ember tracks argument changes,
updates the same utility after rendering, and cleans it up when the helper leaves
the template. Function-valued options are passed through without invocation.

## Example

```hbs
{{#let (useBatcher this.execute wait=this.wait) as |utility|}}
  {{utility.state}}
{{/let}}
```

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `void`\]
        \| \[(`items`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>;
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
new UseBatcher<TValue, TSelected>(owner?): UseBatcher;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseBatcher`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => void]
      | [
          fn: (items: Array<TValue>) => void,
          selector: (state: BatcherState<TValue>) => TSelected,
        ]
    Named: EmberBatcherOptions<TValue, TSelected>
  }
  Return: EmberBatcher<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberBatcher<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/batcher/useBatcher.ts:67](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatcher.ts#L67)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
