---
id: PreactAsyncDebouncerOptions
title: PreactAsyncDebouncerOptions
---

# Interface: PreactAsyncDebouncerOptions\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L13)

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

Defined in: [preact-pacer/src/async-debouncer/useAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-debouncer/useAsyncDebouncer.ts#L21)

Optional callback invoked when the component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel + abort); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`PreactAsyncDebouncer`](PreactAsyncDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
