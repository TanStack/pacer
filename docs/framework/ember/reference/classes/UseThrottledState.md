---
id: UseThrottledState
title: UseThrottledState
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledState.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledState.ts#L26)

Creates throttled state from an initial value.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottledState`](../interfaces/EmberThrottledState.md)\<`TValue`, `TSelected`\>;
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
new UseThrottledState<TValue, TSelected>(owner?): UseThrottledState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottledState`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
        ]
    Named: EmberThrottlerOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberThrottledState<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberThrottledState<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledState.ts:45](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledState.ts#L45)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>

#### Returns

[`EmberThrottledState`](../interfaces/EmberThrottledState.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
