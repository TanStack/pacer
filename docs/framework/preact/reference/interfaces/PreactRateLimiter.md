---
id: PreactRateLimiter
title: PreactRateLimiter
---

# Interface: PreactRateLimiter\<TFn, TSelected\>

Defined in: preact-pacer/src/rate-limiter/useRateLimiter.ts:12

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
readonly state: Readonly<TSelected>;
```

Defined in: preact-pacer/src/rate-limiter/useRateLimiter.ts:21

Reactive state that will be updated and re-rendered when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: preact-pacer/src/rate-limiter/useRateLimiter.ts:27

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.
