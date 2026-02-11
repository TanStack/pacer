---
id: rateLimiterOptions
title: rateLimiterOptions
---

# Function: rateLimiterOptions()

```ts
function rateLimiterOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [rate-limiter.ts:92](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L92)

Utility function for sharing common `RateLimiterOptions` options between different `RateLimiter` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md) = [`AnyFunction`](../type-aliases/AnyFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`RateLimiterOptions`](../interfaces/RateLimiterOptions.md)\<`TFn`\>\> = `Partial`\<[`RateLimiterOptions`](../interfaces/RateLimiterOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
