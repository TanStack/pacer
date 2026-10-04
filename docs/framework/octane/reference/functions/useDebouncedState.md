---
id: useDebouncedState
title: useDebouncedState
---

```ts
function useDebouncedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedState.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncedState.ts#L9)

Creates debounced state with a setter and the underlying utility.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneDebouncerOptions`](../interfaces/OctaneDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, `SetValue`\<`TValue`\>, [`OctaneDebouncer`](../interfaces/OctaneDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
