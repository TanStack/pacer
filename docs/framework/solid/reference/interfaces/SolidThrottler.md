---
id: SolidThrottler
title: SolidThrottler
---

# Interface: SolidThrottler\<TFn, TSelected\>

Defined in: [solid-pacer/src/throttler/createThrottler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L13)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/throttler/createThrottler.ts:22](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L22)

Reactive state that will be updated when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [solid-pacer/src/throttler/createThrottler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L28)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
