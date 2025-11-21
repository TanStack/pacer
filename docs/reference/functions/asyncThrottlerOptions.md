---
id: asyncThrottlerOptions
title: asyncThrottlerOptions
---

# Function: asyncThrottlerOptions()

```ts
function asyncThrottlerOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [async-throttler.ts:148](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L148)

Utility function for sharing common `AsyncThrottlerOptions` options between different `AsyncThrottler` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md) = [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncThrottlerOptions`](../../interfaces/AsyncThrottlerOptions.md)\<`TFn`\>\> = `Partial`\<[`AsyncThrottlerOptions`](../../interfaces/AsyncThrottlerOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
