---
id: createRateLimitedValue
title: createRateLimitedValue
---

```ts
function createRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimitedValue.ts:11](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimitedValue.ts#L11)

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteRateLimiterOptions`](../interfaces/SvelteRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, [`SvelteRateLimiter`](../interfaces/SvelteRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
