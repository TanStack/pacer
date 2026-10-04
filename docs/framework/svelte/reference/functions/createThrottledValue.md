---
id: createThrottledValue
title: createThrottledValue
---

```ts
function createThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, SvelteThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/throttler/createThrottledValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottledValue.ts#L8)

Derives a throttled value from a reactive source. Returns the value and its utility.

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteThrottlerOptions`](../interfaces/SvelteThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteThrottler`](../interfaces/SvelteThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
