---
id: OctaneRateLimiterOptions
title: OctaneRateLimiterOptions
---

Defined in: [rate-limiter/useRateLimiter.ts:16](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L16)

Options for useRateLimiter, including owner cleanup.

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
optional onUnmount?: (instance) => void;
```

Defined in: [rate-limiter/useRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneRateLimiter`](OctaneRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
