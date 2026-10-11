---
id: LitAsyncDebouncerOptions
title: LitAsyncDebouncerOptions
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L14)

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

Defined in: [async-debouncer/createAsyncDebouncer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncer.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitAsyncDebouncer`](LitAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
