---
id: createDebouncedState
title: createDebouncedState
---

```ts
function createDebouncedState<TValue, TSelected>(
   scope,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/createDebouncedState.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/debouncer/createDebouncedState.ts#L13)

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

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### initialValue

`TValue`

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
