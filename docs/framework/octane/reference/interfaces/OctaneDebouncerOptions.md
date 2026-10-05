---
id: OctaneDebouncerOptions
title: OctaneDebouncerOptions
---

Defined in: [debouncer/useDebouncer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L16)

Options for useDebouncer, including owner cleanup.

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

Defined in: [debouncer/useDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncer.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneDebouncer`](OctaneDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
