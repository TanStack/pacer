---
id: debouncerOptions
title: debouncerOptions
---

# Function: debouncerOptions()

```ts
function debouncerOptions<TFn, TOptions>(options): TOptions;
```

Defined in: [debouncer.ts:98](https://github.com/klink-ing/pacer/blob/main/packages/pacer/src/debouncer.ts#L98)

Utility function for sharing common `DebouncerOptions` options between different `Debouncer` instances.

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md) = [`AnyFunction`](../type-aliases/AnyFunction.md)

### TOptions

`TOptions` *extends* `Partial`\<[`DebouncerOptions`](../interfaces/DebouncerOptions.md)\<`TFn`\>\> = `Partial`\<[`DebouncerOptions`](../interfaces/DebouncerOptions.md)\<`TFn`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
