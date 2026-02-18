---
id: PreactRateLimiterOptions
title: PreactRateLimiterOptions
---

# Interface: PreactRateLimiterOptions\<TFn, TSelected\>

Defined in: [preact-pacer/src/rate-limiter/useRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L13)

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

Defined in: [preact-pacer/src/rate-limiter/useRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L21)

Optional callback invoked when the component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup; use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`PreactRateLimiter`](PreactRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
