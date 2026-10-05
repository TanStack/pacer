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

Defined in: [rate-limiter/useRateLimitedValue.ts:37](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimitedValue.ts#L37)

Derives a rate-limited value from its current source.

Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.

## Return value

Returns [value, utility]. The value is a readonly shallow ref; read value.value in JavaScript or bind the ref in a template. The source may be a value, a ref, or a getter. The initial value is available immediately. Source changes schedule updates on the existing utility.

## State and ownership

The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.

Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.

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

## Example

```ts
import { ref } from 'vue'
import { useRateLimitedValue } from '@tanstack/vue-pacer'

// During component setup:
const source = ref('')
const [value, utility] = useRateLimitedValue(source, { limit: 3, window: 1000 })
// Bind value and use utility for controls. Read value.value for the committed value.
```

## See

useRateLimiter
