---
id: createRateLimitedSignal
title: createRateLimitedSignal
---

# Function: createRateLimitedSignal()

```ts
function createRateLimitedSignal<TValue, TSelected>(
   value, 
   initialOptions, 
   selector?): [Signal<TValue>, Setter<TValue>, AngularRateLimiter<Setter<TValue>, TSelected>];
```

Defined in: [angular-pacer/src/rate-limiter/createRateLimitedSignal.ts:52](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/createRateLimitedSignal.ts#L52)

An Angular function that creates a rate-limited state signal, combining Angular's signal with rate limiting functionality.
This function provides both the current rate-limited value and methods to update it.

Rate limiting is a simple "hard limit" approach - it allows all updates until the limit is reached, then blocks
subsequent updates until the window resets. Unlike throttling or debouncing, it does not attempt to space out
or intelligently collapse updates.

The function returns a tuple containing:
- The current rate-limited value signal
- A function to update the rate-limited value
- The rate limiter instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying rate limiter instance.
The `selector` parameter allows you to specify which rate limiter state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### value

`TValue`

### initialOptions

`RateLimiterOptions`\<`Setter`\<`TValue`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Signal`\<`TValue`\>, `Setter`\<`TValue`\>, [`AngularRateLimiter`](../interfaces/AngularRateLimiter.md)\<`Setter`\<`TValue`\>, `TSelected`\>\]

## Example

```ts
// Default behavior - no reactive state subscriptions
const [value, setValue, rateLimiter] = createRateLimitedSignal(0, {
  limit: 5,
  window: 60000,
  windowType: 'sliding'
});

// Opt-in to reactive updates when limit state changes
const [value, setValue, rateLimiter] = createRateLimitedSignal(
  0,
  { limit: 5, window: 60000 },
  (state) => ({ rejectionCount: state.rejectionCount })
);
```
