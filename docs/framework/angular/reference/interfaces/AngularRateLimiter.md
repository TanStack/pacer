---
id: AngularRateLimiter
title: AngularRateLimiter
---

Defined in: packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:52

An Angular RateLimiter ref with stable core methods and readonly selected state.
Read `state()` to observe the selector result; without a selector it returns `{}`.

## Extends

- `Pick`\<`RateLimiter`\<`TFn`\>, `RateLimiterMethod`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<ReadonlySelected<TSelected>>;
```

Defined in: packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:57

The readonly selector result. Returns an empty object when no selector is supplied.
