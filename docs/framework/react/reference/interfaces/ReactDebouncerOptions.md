---
id: ReactDebouncerOptions
title: ReactDebouncerOptions
---

# Interface: ReactDebouncerOptions\<TFn, TSelected\>

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L13)

## Extends

- `DebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount()?

```ts
optional onUnmount: (debouncer) => void;
```

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L21)

Optional callback invoked when the component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`ReactDebouncer`](ReactDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
