---
id: UseDebouncedState
title: UseDebouncedState
---

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedState.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedState.ts#L26)

Creates debounced state from an initial value.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberDebouncedState`](../interfaces/EmberDebouncedState.md)\<`TValue`, `TSelected`\>;
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
new UseDebouncedState<TValue, TSelected>(owner?): UseDebouncedState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseDebouncedState`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (state: DebouncerState<SetValue<TValue>>) => TSelected,
        ]
    Named: EmberDebouncerOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberDebouncedState<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberDebouncedState<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/debouncer/useDebouncedState.ts:45](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/debouncer/useDebouncedState.ts#L45)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberDebouncerOptions`](../interfaces/EmberDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>

#### Returns

[`EmberDebouncedState`](../interfaces/EmberDebouncedState.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
