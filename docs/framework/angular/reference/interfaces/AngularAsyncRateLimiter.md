---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

# Interface: AngularAsyncRateLimiter\<TFn, TSelected\>

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L24)

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
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L33)

Reactive state signal that will be updated when the async rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L38)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
