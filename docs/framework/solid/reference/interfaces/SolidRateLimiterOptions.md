---
id: SolidRateLimiterOptions
title: SolidRateLimiterOptions
---

Defined in: [rate-limiter/createRateLimiter.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L15)

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

Defined in: [rate-limiter/createRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L23)

Optional callback invoked when the owning component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup; use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`SolidRateLimiter`](SolidRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
