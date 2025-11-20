---
id: asyncRetryerOptions
title: asyncRetryerOptions
---

# Function: asyncRetryerOptions()

```ts
function asyncRetryerOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [async-retryer.ts:164](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L164)

Utility function for sharing common `AsyncRetryerOptions` options between different `AsyncRetryer` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md) = [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncRetryerOptions`](../../interfaces/AsyncRetryerOptions.md)\<`TFn`\>\> = `Partial`\<[`AsyncRetryerOptions`](../../interfaces/AsyncRetryerOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
