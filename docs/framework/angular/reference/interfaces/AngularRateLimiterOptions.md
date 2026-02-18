---
id: AngularRateLimiterOptions
title: AngularRateLimiterOptions
---

# Interface: AngularRateLimiterOptions\<TFn, TSelected\>

Defined in: [angular-pacer/src/rate-limiter/injectRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L13)

## Extends

- `RateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (rateLimiter) => void;
```

Defined in: [angular-pacer/src/rate-limiter/injectRateLimiter.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L20)

Optional callback invoked when the component is destroyed. Receives the rate limiter instance.

#### Parameters

##### rateLimiter

[`AngularRateLimiter`](AngularRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
