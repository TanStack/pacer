---
id: createRateLimitedSignal
title: createRateLimitedSignal
---

```ts
function createRateLimitedSignal<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/rate-limiter/createRateLimitedSignal.ts:15](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/rate-limiter/createRateLimitedSignal.ts#L15)

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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteRateLimiterOptions`](../interfaces/SvelteRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`SvelteRateLimiter`](../interfaces/SvelteRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
