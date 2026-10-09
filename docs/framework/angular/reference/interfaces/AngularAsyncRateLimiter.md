---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:55](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L55)

An Angular AsyncRateLimiter ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`AsyncRateLimiter`\<`TFn`\>, `AsyncRateLimiterMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:60](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L60)

The readonly selector result. Returns an empty object when no selector is supplied.
