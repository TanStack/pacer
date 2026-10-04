---
id: useRateLimitedState
title: useRateLimitedState
---

```ts
function useRateLimitedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, SetValue<TValue>, VueRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedState.ts:12](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimitedState.ts#L12)

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

### initialValue

`TValue`

### options

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueRateLimiterOptions`](../interfaces/VueRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, `SetValue`\<`TValue`\>, [`VueRateLimiter`](../interfaces/VueRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
