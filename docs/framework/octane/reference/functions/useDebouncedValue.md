---
id: useDebouncedValue
title: useDebouncedValue
---

```ts
function useDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/debouncer/useDebouncedValue.ts#L9)

Derives a debounced value from the current render value.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### source

`TValue`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneDebouncerOptions`](../interfaces/OctaneDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneDebouncer`](../interfaces/OctaneDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
