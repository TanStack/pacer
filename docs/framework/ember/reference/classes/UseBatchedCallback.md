---
id: UseBatchedCallback
title: UseBatchedCallback
---

Defined in: [packages/ember-pacer/src/batcher/useBatchedCallback.ts:14](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatchedCallback.ts#L14)

Returns a batched callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `void`\]
        \| \[(`items`) => `void`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberBatcher`](../interfaces/EmberBatcher.md)\<`TValue`, `TSelected`\>\[`"addItem"`\];
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
new UseBatchedCallback<TValue, TSelected>(owner?): UseBatchedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseBatchedCallback`

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
  Return: EmberBatcher<TValue, TSelected>['addItem']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (item) => void;
```

Defined in: [packages/ember-pacer/src/batcher/useBatchedCallback.ts:34](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/batcher/useBatchedCallback.ts#L34)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `void`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberBatcherOptions`](../interfaces/EmberBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

```ts
(item): void;
```

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`void`

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
