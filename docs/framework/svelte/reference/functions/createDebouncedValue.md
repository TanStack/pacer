---
id: createDebouncedValue
title: createDebouncedValue
---

```ts
function createDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, SvelteDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncedValue.ts#L8)

Derives a debounced value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### source

`ValueSource`\<`TValue`\>

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteDebouncer`](../interfaces/SvelteDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
