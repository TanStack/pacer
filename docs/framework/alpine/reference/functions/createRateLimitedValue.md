---
id: createRateLimitedValue
title: createRateLimitedValue
---

```ts
function createRateLimitedValue<TValue, TSelected>(
   scope,
   source,
   options,
   selector?): [CellValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [rate-limiter/createRateLimitedValue.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimitedValue.ts#L12)

Derives a ratelimited value from a reactive source. Returns the value and its utility.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### source

`ValueSource`\<`TValue`\>

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
