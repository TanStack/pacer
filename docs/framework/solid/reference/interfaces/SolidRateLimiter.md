---
id: SolidRateLimiter
title: SolidRateLimiter
---

# Interface: SolidRateLimiter\<TFn, TSelected\>

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L12)

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"store"`\>

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

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L21)

Reactive state that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L27)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
