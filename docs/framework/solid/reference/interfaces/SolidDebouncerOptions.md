---
id: SolidDebouncerOptions
title: SolidDebouncerOptions
---

# Interface: SolidDebouncerOptions\<TFn, TSelected\>

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L13)

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

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L21)

Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`SolidDebouncer`](SolidDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
