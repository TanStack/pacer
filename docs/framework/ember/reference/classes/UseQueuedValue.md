---
id: UseQueuedValue
title: UseQueuedValue
---

Defined in: [packages/ember-pacer/src/queuer/useQueuedValue.ts:25](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedValue.ts#L25)

Derives a queued value from its tracked positional input.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberQueuedValue`](../interfaces/EmberQueuedValue.md)\<`TValue`, `TSelected`\>;
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
new UseQueuedValue<TValue, TSelected>(owner?): UseQueuedValue;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseQueuedValue`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: QueuerState<TValue>) => TSelected]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuedValue<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberQueuedValue<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuedValue.ts:42](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuedValue.ts#L42)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberQueuerOptions`](../interfaces/EmberQueuerOptions.md)\<`TValue`, `TSelected`\>

#### Returns

[`EmberQueuedValue`](../interfaces/EmberQueuedValue.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
