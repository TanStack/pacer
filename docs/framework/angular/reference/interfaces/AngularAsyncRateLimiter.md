---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

# Interface: AngularAsyncRateLimiter\<TFn, TSelected\>

Defined in: [angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L12)

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

Defined in: [angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:21](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L21)

Reactive state signal that will be updated when the async rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:26](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L26)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
