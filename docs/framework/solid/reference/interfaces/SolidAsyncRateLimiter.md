---
id: SolidAsyncRateLimiter
title: SolidAsyncRateLimiter
---

# Interface: SolidAsyncRateLimiter\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L12)

## Extends

- `Omit`\<`AsyncRateLimiter`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L21)

Reactive state that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L27)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
