---
id: VueRateLimiterOptions
title: VueRateLimiterOptions
---

Defined in: [rate-limiter/useRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L13)

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

Defined in: [rate-limiter/useRateLimiter.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueRateLimiter`](VueRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
