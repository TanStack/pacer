---
id: AngularAsyncRateLimiterOptions
title: AngularAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:23](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L23)

## Extends

- `AsyncRateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (rateLimiter) => void;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:31](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L31)

Optional callback invoked when the component is destroyed. Receives the rate limiter instance.
When provided, replaces the default cleanup (abort).

#### Parameters

##### rateLimiter

[`AngularAsyncRateLimiter`](AngularAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
