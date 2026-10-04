---
id: createRateLimitedState
title: createRateLimitedState
---

```ts
function createRateLimitedState<TValue, TSelected>(
   host,
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, LitRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/createRateLimitedState.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimitedState.ts#L13)

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

### host

`ReactiveControllerHost`

### initialValue

`TValue`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`LitRateLimiter`](../interfaces/LitRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
