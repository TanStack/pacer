---
id: VueAsyncDebouncerOptions
title: VueAsyncDebouncerOptions
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L13)

Options for useAsyncDebouncer, including owner cleanup.

## Extends

- `AsyncDebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [async-debouncer/useAsyncDebouncer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-debouncer/useAsyncDebouncer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`VueAsyncDebouncer`](VueAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
