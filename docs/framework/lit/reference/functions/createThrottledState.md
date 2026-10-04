---
id: createThrottledState
title: createThrottledState
---

```ts
function createThrottledState<TValue, TSelected>(
   host,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, LitThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/createThrottledState.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/throttler/createThrottledState.ts#L13)

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

### host

`ReactiveControllerHost`

### initialValue

`TValue`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitThrottlerOptions`](../interfaces/LitThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`LitThrottler`](../interfaces/LitThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
