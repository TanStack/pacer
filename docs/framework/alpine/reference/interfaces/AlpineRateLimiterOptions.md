---
id: AlpineRateLimiterOptions
title: AlpineRateLimiterOptions
---

Defined in: [rate-limiter/createRateLimiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L12)

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

Defined in: [rate-limiter/createRateLimiter.ts:17](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineRateLimiter`](AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
