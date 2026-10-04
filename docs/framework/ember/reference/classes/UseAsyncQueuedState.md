---
id: UseAsyncQueuedState
title: UseAsyncQueuedState
---

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuedState.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuedState.ts#L17)

Returns the queue with pending items selected by default.

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

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

## Constructors

### Constructor

```ts
new UseAsyncQueuedState<TValue, TSelected>(owner?): UseAsyncQueuedState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncQueuedState`

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

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuedState.ts:43](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuedState.ts#L43)

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
