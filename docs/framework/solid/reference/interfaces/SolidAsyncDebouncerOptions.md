---
id: SolidAsyncDebouncerOptions
title: SolidAsyncDebouncerOptions
---

Defined in: [async-debouncer/createAsyncDebouncer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L15)

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
optional onUnmount?: (debouncer) => void;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L23)

Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`SolidAsyncDebouncer`](SolidAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
