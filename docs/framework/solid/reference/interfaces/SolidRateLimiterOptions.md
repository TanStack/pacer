---
id: SolidRateLimiterOptions
title: SolidRateLimiterOptions
---

# Interface: SolidRateLimiterOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L13)

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

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup; use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`SolidRateLimiter`](SolidRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
