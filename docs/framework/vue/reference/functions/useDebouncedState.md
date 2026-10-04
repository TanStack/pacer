---
id: useDebouncedState
title: useDebouncedState
---

```ts
function useDebouncedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, SetValue<TValue>, VueDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedState.ts:12](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncedState.ts#L12)

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueDebouncerOptions`](../interfaces/VueDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, `SetValue`\<`TValue`\>, [`VueDebouncer`](../interfaces/VueDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
