---
id: createThrottledSignal
title: createThrottledSignal
---

```ts
function createThrottledSignal<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, SvelteThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [packages/svelte-pacer/src/throttler/createThrottledSignal.ts:12](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottledSignal.ts#L12)

Creates a throttled state value and its setter. Functional updates are evaluated
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

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteThrottlerOptions`](../interfaces/SvelteThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`SvelteThrottler`](../interfaces/SvelteThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
