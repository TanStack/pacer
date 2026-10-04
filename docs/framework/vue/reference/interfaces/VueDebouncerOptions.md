---
id: VueDebouncerOptions
title: VueDebouncerOptions
---

Defined in: [debouncer/useDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L13)

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

Defined in: [debouncer/useDebouncer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueDebouncer`](VueDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
