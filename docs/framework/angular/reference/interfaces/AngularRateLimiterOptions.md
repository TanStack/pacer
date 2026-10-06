---
id: AngularRateLimiterOptions
title: AngularRateLimiterOptions
---

Defined in: [rate-limiter/injectRateLimiter.ts:21](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L21)

## Extends

- `RateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (rateLimiter) => void;
```

Defined in: [rate-limiter/injectRateLimiter.ts:28](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L28)

Optional callback invoked when the component is destroyed. Receives the rate limiter instance.

#### Parameters

##### rateLimiter

[`AngularRateLimiter`](AngularRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
