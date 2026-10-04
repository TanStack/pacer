---
id: LitRateLimiterOptions
title: LitRateLimiterOptions
---

Defined in: [rate-limiter/createRateLimiter.ts:14](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L14)

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

Defined in: [rate-limiter/createRateLimiter.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitRateLimiter`](LitRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
