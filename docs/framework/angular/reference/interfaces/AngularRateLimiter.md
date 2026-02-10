---
id: AngularRateLimiter
title: AngularRateLimiter
---

# Interface: AngularRateLimiter\<TFn, TSelected\>

Defined in: [rate-limiter/injectRateLimiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L12)

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
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L21)

Reactive state signal that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L26)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
