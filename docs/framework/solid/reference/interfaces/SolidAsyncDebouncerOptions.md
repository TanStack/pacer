---
id: SolidAsyncDebouncerOptions
title: SolidAsyncDebouncerOptions
---

# Interface: SolidAsyncDebouncerOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L13)

## Extends

- `AsyncDebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (debouncer) => void;
```

Defined in: [solid-pacer/src/async-debouncer/createAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`SolidAsyncDebouncer`](SolidAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
