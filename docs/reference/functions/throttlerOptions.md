---
id: throttlerOptions
title: throttlerOptions
---

# Function: throttlerOptions()

```ts
function throttlerOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [throttler.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L101)

Utility function for sharing common `ThrottlerOptions` options between different `Throttler` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md) = [`AnyFunction`](../type-aliases/AnyFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`ThrottlerOptions`](../interfaces/ThrottlerOptions.md)\<`TFn`\>\> = `Partial`\<[`ThrottlerOptions`](../interfaces/ThrottlerOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
