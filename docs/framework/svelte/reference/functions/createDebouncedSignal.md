---
id: createDebouncedSignal
title: createDebouncedSignal
---

```ts
function createDebouncedSignal<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, SvelteDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/debouncer/createDebouncedSignal.ts:12](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/debouncer/createDebouncedSignal.ts#L12)

Creates a debounced state value and its setter. Functional updates are evaluated
when the utility executes, using the last committed value. The third tuple entry
exposes control methods and opt-in selected state.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### initialValue

`TValue`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteDebouncerOptions`](../interfaces/SvelteDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`SvelteDebouncer`](../interfaces/SvelteDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
