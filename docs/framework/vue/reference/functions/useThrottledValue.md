---
id: useThrottledValue
title: useThrottledValue
---

```ts
function useThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [Readonly<ShallowRef<TValue>>, VueThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledValue.ts:8](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/throttler/useThrottledValue.ts#L8)

Derives a throttled value from a reactive source. Returns the value and its utility.

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

[`VuePacerOptions`](../type-aliases/VuePacerOptions.md)\<[`VueThrottlerOptions`](../interfaces/VueThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Readonly`\<`ShallowRef`\<`TValue`\>\>, [`VueThrottler`](../interfaces/VueThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
