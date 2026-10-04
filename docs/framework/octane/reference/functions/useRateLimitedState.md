---
id: useRateLimitedState
title: useRateLimitedState
---

```ts
function useRateLimitedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [TValue, SetValue<TValue>, OctaneRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedState.ts:12](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimitedState.ts#L12)

Creates ratelimited state with a setter and the underlying utility.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneRateLimiterOptions`](../interfaces/OctaneRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, `SetValue`\<`TValue`\>, [`OctaneRateLimiter`](../interfaces/OctaneRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
