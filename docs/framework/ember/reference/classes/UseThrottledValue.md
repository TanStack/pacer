---
id: UseThrottledValue
title: UseThrottledValue
---

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:25](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L25)

Derives a throttled value from its tracked positional input.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<(`value`) => `void`, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberThrottledValue`](../interfaces/EmberThrottledValue.md)\<`TValue`, `TSelected`\>;
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
new UseThrottledValue<TValue, TSelected>(owner?): UseThrottledValue;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseThrottledValue`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (
            state: ThrottlerState<(value: TValue) => void>,
          ) => TSelected,
        ]
    Named: EmberThrottlerOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberThrottledValue<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberThrottledValue<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/throttler/useThrottledValue.ts:48](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/throttler/useThrottledValue.ts#L48)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberThrottlerOptions`](../interfaces/EmberThrottlerOptions.md)\<(`value`) => `void`, `TSelected`\>

#### Returns

[`EmberThrottledValue`](../interfaces/EmberThrottledValue.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
