---
id: useRateLimitedValue
title: useRateLimitedValue
---

```ts
function useRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedValue.ts:12](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimitedValue.ts#L12)

Derives a ratelimited value from the current render value.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### source

`TValue`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneRateLimiterOptions`](../interfaces/OctaneRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneRateLimiter`](../interfaces/OctaneRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
