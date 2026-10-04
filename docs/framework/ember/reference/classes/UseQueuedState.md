---
id: UseQueuedState
title: UseQueuedState
---

Defined in: [packages/ember-pacer/src/queuer/useQueuedState.ts:14](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedState.ts#L14)

Returns the queue with pending items selected by default.

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

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

## Constructors

### Constructor

```ts
new UseQueuedState<TValue, TSelected>(owner?): UseQueuedState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseQueuedState`

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

Defined in: [packages/ember-pacer/src/queuer/useQueuedState.ts:40](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedState.ts#L40)

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
