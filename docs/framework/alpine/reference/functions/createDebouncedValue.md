---
id: createDebouncedValue
title: createDebouncedValue
---

```ts
function createDebouncedValue<TValue, TSelected>(
   scope,
   source,
   options,
   selector?): [CellValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/createDebouncedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncedValue.ts#L9)

Derives a debounced value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### source

`ValueSource`\<`TValue`\>

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
