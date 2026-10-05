---
id: VueRateLimiterOptions
title: VueRateLimiterOptions
---

Defined in: [rate-limiter/useRateLimiter.ts:14](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L14)

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

Defined in: [rate-limiter/useRateLimiter.ts:19](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueRateLimiter`](VueRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
