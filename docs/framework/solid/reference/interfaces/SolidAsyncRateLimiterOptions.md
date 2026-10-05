---
id: SolidAsyncRateLimiterOptions
title: SolidAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L15)

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

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L23)

Optional callback invoked when the owning component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup (abort); use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`SolidAsyncRateLimiter`](SolidAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
