---
id: SolidDebouncerOptions
title: SolidDebouncerOptions
---

Defined in: [debouncer/createDebouncer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L15)

## Extends

- `DebouncerOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (debouncer) => void;
```

Defined in: [debouncer/createDebouncer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L23)

Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`SolidDebouncer`](SolidDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
