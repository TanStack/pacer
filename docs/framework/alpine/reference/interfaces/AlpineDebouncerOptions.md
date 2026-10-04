---
id: AlpineDebouncerOptions
title: AlpineDebouncerOptions
---

Defined in: [debouncer/createDebouncer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L12)

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

Defined in: [debouncer/createDebouncer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncer.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineDebouncer`](AlpineDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
