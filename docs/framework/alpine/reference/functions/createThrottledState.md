---
id: createThrottledState
title: createThrottledState
---

```ts
function createThrottledState<TValue, TSelected>(
   scope,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/createThrottledState.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottledState.ts#L13)

Creates a throttled state value and its setter. Functional updates are evaluated
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

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
