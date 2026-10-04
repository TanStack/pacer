---
id: UseAsyncBatchedCallback
title: UseAsyncBatchedCallback
---

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts#L17)

Returns a asyncbatched callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`:   \| \[(`items`) => `Promise`\<`any`\>\]
        \| \[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncBatcher`](../interfaces/EmberAsyncBatcher.md)\<`TValue`, `TSelected`\>\[`"addItem"`\];
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
new UseAsyncBatchedCallback<TValue, TSelected>(owner?): UseAsyncBatchedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncBatchedCallback`

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
  Return: EmberAsyncBatcher<TValue, TSelected>['addItem']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (item) => Promise<any>;
```

Defined in: [packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts:37](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-batcher/useAsyncBatchedCallback.ts#L37)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[(`items`) => `Promise`\<`any`\>, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncBatcherOptions`](../interfaces/EmberAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>

#### Returns

```ts
(item): Promise<any>;
```

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

##### Throws

The error from the batch function if no onError handler is configured or throwOnError is true

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
