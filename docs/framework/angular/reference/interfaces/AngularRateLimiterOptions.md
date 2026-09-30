---
id: AngularRateLimiterOptions
title: AngularRateLimiterOptions
---

Defined in: [rate-limiter/injectRateLimiter.ts:15](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L15)

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

Defined in: [rate-limiter/injectRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L22)

Optional callback invoked when the component is destroyed. Receives the rate limiter instance.

#### Parameters

##### rateLimiter

[`AngularRateLimiter`](AngularRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
