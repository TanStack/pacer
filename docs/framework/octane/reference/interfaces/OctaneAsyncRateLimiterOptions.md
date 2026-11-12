---
id: OctaneAsyncRateLimiterOptions
title: OctaneAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:16](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L16)

Options for useAsyncRateLimiter, including owner cleanup.

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
optional onUnmount?: (instance) => void;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneAsyncRateLimiter`](OctaneAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
