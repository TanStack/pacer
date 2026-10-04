---
id: createDebouncedState
title: createDebouncedState
---

```ts
function createDebouncedState<TValue, TSelected>(
   host,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, LitDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/createDebouncedState.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/debouncer/createDebouncedState.ts#L13)

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

### host

`ReactiveControllerHost`

### initialValue

`TValue`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitDebouncerOptions`](../interfaces/LitDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`LitDebouncer`](../interfaces/LitDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
