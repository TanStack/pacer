---
id: useThrottledValue
title: useThrottledValue
---

```ts
function useThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledValue.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottledValue.ts#L9)

Derives a throttled value from the current render value.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneThrottlerOptions`](../interfaces/OctaneThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, [`OctaneThrottler`](../interfaces/OctaneThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
