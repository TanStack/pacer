---
id: PreactAsyncRateLimiterOptions
title: PreactAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:14](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L14)

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

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L22)

Optional callback invoked when the component unmounts. Receives the rate limiter instance.
When provided, replaces the default cleanup (abort); use it to call reset(), add logging, etc.

#### Parameters

##### rateLimiter

[`PreactAsyncRateLimiter`](PreactAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
