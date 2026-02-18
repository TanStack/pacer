---
id: SolidAsyncRateLimiterOptions
title: SolidAsyncRateLimiterOptions
---

# Interface: SolidAsyncRateLimiterOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L13)

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

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup (abort); use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`SolidAsyncRateLimiter`](SolidAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
