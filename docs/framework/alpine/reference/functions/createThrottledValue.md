---
id: createThrottledValue
title: createThrottledValue
---

```ts
function createThrottledValue<TValue, TSelected>(
   scope,
   source,
   options,
   selector?): [CellValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/createThrottledValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottledValue.ts#L9)

Derives a throttled value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### source

`ValueSource`\<`TValue`\>

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
