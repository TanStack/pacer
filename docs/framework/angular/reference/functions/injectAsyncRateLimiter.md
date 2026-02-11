---
id: injectAsyncRateLimiter
title: injectAsyncRateLimiter
---

# Function: injectAsyncRateLimiter()

```ts
function injectAsyncRateLimiter<TFn, TSelected>(
   fn, 
   options, 
selector): AngularAsyncRateLimiter<TFn, TSelected>;
```

Defined in: [angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:66](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L66)

An Angular function that creates and manages an AsyncRateLimiter instance.

This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async rate limiting functionality with promise support, error handling,
retry capabilities, and abort support.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### options

`AsyncRateLimiterOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncRateLimiter`](../interfaces/AngularAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const rateLimiter = injectAsyncRateLimiter(
  async (id: string) => {
    const response = await fetch(`/api/data/${id}`);
    return response.json();
  },
  { limit: 5, window: 60000, windowType: 'sliding' }
);

// In an event handler
const handleRequest = async (id: string) => {
  const result = await rateLimiter.maybeExecute(id);
  console.log('Result:', result);
};
```
