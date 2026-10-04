---
id: useThrottledState
title: useThrottledState
---

```ts
function useThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, SetValue<TValue>, VueThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledState.ts:12](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottledState.ts#L12)

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueThrottlerOptions`](../interfaces/VueThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, `SetValue`\<`TValue`\>, [`VueThrottler`](../interfaces/VueThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
