---
id: AlpineRateLimiterOptions
title: AlpineRateLimiterOptions
---

Defined in: [rate-limiter/createRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L13)

Options for createRateLimiter, including owner cleanup.

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

Defined in: [rate-limiter/createRateLimiter.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineRateLimiter`](AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
