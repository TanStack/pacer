---
id: UseDebouncedValue
title: UseDebouncedValue
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:25](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L25)

Derives a debounced value from its tracked positional input.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<(`value`) => `void`, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncedValue`](../interfaces/EmberDebouncedValue.md)\<`TValue`, `TSelected`\>;
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
new UseDebouncedValue<TValue, TSelected>(owner?): UseDebouncedValue;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncedValue`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (
            state: DebouncerState<(value: TValue) => void>,
          ) => TSelected,
        ]
    Named: EmberDebouncerOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberDebouncedValue<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberDebouncedValue<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedValue.ts:48](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedValue.ts#L48)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<(`value`) => `void`, `TSelected`\>

#### Returns

[`EmberDebouncedValue`](../interfaces/EmberDebouncedValue.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
