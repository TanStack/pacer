---
id: useRateLimitedValue
title: useRateLimitedValue
---

```ts
function useRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, VueRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/useRateLimitedValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimitedValue.ts#L8)

Derives a ratelimited value from a reactive source. Returns the value and its utility.

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueRateLimiterOptions`](../interfaces/VueRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, [`VueRateLimiter`](../interfaces/VueRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
