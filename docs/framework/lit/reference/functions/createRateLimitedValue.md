---
id: createRateLimitedValue
title: createRateLimitedValue
---

```ts
function createRateLimitedValue<TValue, TSelected>(
   host,
   source,
   options,
   selector?): [CellValue<TValue>, LitRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/createRateLimitedValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimitedValue.ts#L9)

Derives a ratelimited value from a reactive source. Returns the value and its utility.

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

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitRateLimiterOptions`](../interfaces/LitRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`LitRateLimiter`](../interfaces/LitRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
