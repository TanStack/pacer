---
id: asyncRateLimiterOptions
title: asyncRateLimiterOptions
---

# Function: asyncRateLimiterOptions()

```ts
function asyncRateLimiterOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [async-rate-limiter.ts:148](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L148)

Utility function for sharing common `AsyncRateLimiterOptions` options between different `AsyncRateLimiter` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md) = [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncRateLimiterOptions`](../interfaces/AsyncRateLimiterOptions.md)\<`TFn`\>\> = `Partial`\<[`AsyncRateLimiterOptions`](../interfaces/AsyncRateLimiterOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
