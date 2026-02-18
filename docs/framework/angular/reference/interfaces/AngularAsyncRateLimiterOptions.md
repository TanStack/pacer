---
id: AngularAsyncRateLimiterOptions
title: AngularAsyncRateLimiterOptions
---

# Interface: AngularAsyncRateLimiterOptions\<TFn, TSelected\>

Defined in: [angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L13)

## Extends

- `AsyncRateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (rateLimiter) => void;
```

Defined in: [angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L21)

Optional callback invoked when the component is destroyed. Receives the rate limiter instance.
When provided, replaces the default cleanup (abort).

#### Parameters

##### rateLimiter

[`AngularAsyncRateLimiter`](AngularAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
