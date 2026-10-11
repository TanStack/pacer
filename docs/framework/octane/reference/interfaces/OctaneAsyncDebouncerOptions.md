---
id: OctaneAsyncDebouncerOptions
title: OctaneAsyncDebouncerOptions
---

Defined in: [async-debouncer/useAsyncDebouncer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L16)

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

Defined in: [async-debouncer/useAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-debouncer/useAsyncDebouncer.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneAsyncDebouncer`](OctaneAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
