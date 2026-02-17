---
id: asyncDebouncerOptions
title: asyncDebouncerOptions
---

# Function: asyncDebouncerOptions()

```ts
function asyncDebouncerOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [async-debouncer.ts:146](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L146)

Utility function for sharing common `AsyncDebouncerOptions` options between different `AsyncDebouncer` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md) = [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncDebouncerOptions`](../interfaces/AsyncDebouncerOptions.md)\<`TFn`\>\> = `Partial`\<[`AsyncDebouncerOptions`](../interfaces/AsyncDebouncerOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
