---
id: useDebouncedValue
title: useDebouncedValue
---

```ts
function useDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, VueDebouncer<SetValue<TValue>, TSelected>];
```

Defined in: [debouncer/useDebouncedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/debouncer/useDebouncedValue.ts#L8)

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueDebouncerOptions`](../interfaces/VueDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, [`VueDebouncer`](../interfaces/VueDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
