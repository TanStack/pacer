---
id: PreactDebouncerOptions
title: PreactDebouncerOptions
---

Defined in: [debouncer/useDebouncer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/debouncer/useDebouncer.ts#L14)

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

Defined in: [debouncer/useDebouncer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/debouncer/useDebouncer.ts#L22)

Optional callback invoked when the component unmounts. Receives the debouncer instance.
When provided, replaces the default cleanup (cancel); use it to call flush(), reset(), cancel(), add logging, etc.

#### Parameters

##### debouncer

[`PreactDebouncer`](PreactDebouncer.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
