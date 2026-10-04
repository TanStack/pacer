---
id: createRateLimitedState
title: createRateLimitedState
---

```ts
function createRateLimitedState<TValue, TSelected>(
   scope,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/createRateLimitedState.ts:16](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimitedState.ts#L16)

Creates a ratelimited state value and its setter. Functional updates are evaluated
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

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
