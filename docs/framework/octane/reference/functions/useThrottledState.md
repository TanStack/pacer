---
id: useThrottledState
title: useThrottledState
---

```ts
function useThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>];
```

Defined in: [throttler/useThrottledState.ts:9](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottledState.ts#L9)

Creates throttled state with a setter and the underlying utility.

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

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneThrottlerOptions`](../interfaces/OctaneThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`TValue`, `SetValue`\<`TValue`\>, [`OctaneThrottler`](../interfaces/OctaneThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]
