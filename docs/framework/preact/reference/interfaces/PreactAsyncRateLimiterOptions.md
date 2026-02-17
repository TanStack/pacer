---
id: PreactAsyncRateLimiterOptions
title: PreactAsyncRateLimiterOptions
---

# Interface: PreactAsyncRateLimiterOptions\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L13)

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

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L21)

Optional callback invoked when the component unmounts. Receives the async rate limiter instance.
When provided, replaces the default cleanup; use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`PreactAsyncRateLimiter`](PreactAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
