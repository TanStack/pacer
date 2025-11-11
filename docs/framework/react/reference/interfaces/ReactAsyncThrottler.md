---
id: ReactAsyncThrottler
title: ReactAsyncThrottler
---

# Interface: ReactAsyncThrottler\<TFn, TSelected\>

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:12](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L12)

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L21)

Reactive state that will be updated and re-rendered when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:27](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L27)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
