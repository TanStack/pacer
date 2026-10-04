---
id: createDebouncedValue
title: createDebouncedValue
---

```ts
function createDebouncedValue<TValue, TSelected>(
   host,
   source,
   options,
   selector?): [CellValue<TValue>, LitDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/createDebouncedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncedValue.ts#L9)

Derives a debounced value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

### source

`ValueSource`\<`TValue`\>

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitDebouncerOptions`](../interfaces/LitDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitDebouncer`](../interfaces/LitDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
