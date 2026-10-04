---
id: LitAsyncDebouncerOptions
title: LitAsyncDebouncerOptions
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L13)

Options for createAsyncDebouncer, including owner cleanup.

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitAsyncDebouncer`](LitAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
