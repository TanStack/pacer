---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:61](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L61)

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

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:66](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L66)

The readonly selector result. Returns an empty object when no selector is supplied.
