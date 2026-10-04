---
id: UseRateLimitedState
title: UseRateLimitedState
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:29](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L29)

Creates ratelimited state from an initial value.
Reads and renders through the returned value property. The utility exposes all control methods.
Named options update after rendering; pending work is preserved until owner cleanup.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>;
     `Positional`: \[`TValue`\] \| \[`TValue`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberRateLimitedState`](../interfaces/EmberRateLimitedState.md)\<`TValue`, `TSelected`\>;
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
new UseRateLimitedState<TValue, TSelected>(owner?): UseRateLimitedState;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseRateLimitedState`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberRateLimitedState<TValue, TSelected>
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): EmberRateLimitedState<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts:45](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimitedState.ts#L45)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TValue`, (`state`) => `TSelected`?\]

The positional arguments to the helper

##### options

[`EmberRateLimiterOptions`](../interfaces/EmberRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>

#### Returns

[`EmberRateLimitedState`](../interfaces/EmberRateLimitedState.md)\<`TValue`, `TSelected`\>

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
