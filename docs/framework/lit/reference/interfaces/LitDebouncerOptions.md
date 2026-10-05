---
id: LitDebouncerOptions
title: LitDebouncerOptions
---

Defined in: [debouncer/createDebouncer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L14)

Options for createDebouncer, including owner cleanup.

## Extends

- `DebouncerOptions`\<`TFn`\>

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

Defined in: [debouncer/createDebouncer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncer.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitDebouncer`](LitDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
