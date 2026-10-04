---
id: createThrottledValue
title: createThrottledValue
---

```ts
function createThrottledValue<TValue, TSelected>(
   host,
   source,
   options,
   selector?): [CellValue<TValue>, LitThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/createThrottledValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottledValue.ts#L9)

Derives a throttled value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### host

`ReactiveControllerHost`

### source

`ValueSource`\<`TValue`\>

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitThrottlerOptions`](../interfaces/LitThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitThrottler`](../interfaces/LitThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
