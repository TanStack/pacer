---
id: SvelteAsyncDebouncerOptions
title: SvelteAsyncDebouncerOptions
---

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L12)

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

Defined in: [packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-debouncer/createAsyncDebouncer.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`SvelteAsyncDebouncer`](SvelteAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
