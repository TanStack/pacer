---
id: PreactThrottler
title: PreactThrottler
---

# Interface: PreactThrottler\<TFn, TSelected\>

Defined in: preact-pacer/src/throttler/useThrottler.ts:12

## Extends

- `Omit`\<`Throttler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: preact-pacer/src/throttler/useThrottler.ts:21

Reactive state that will be updated and re-rendered when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: preact-pacer/src/throttler/useThrottler.ts:27

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
