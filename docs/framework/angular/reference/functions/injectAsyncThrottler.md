---
id: injectAsyncThrottler
title: injectAsyncThrottler
---

# Function: injectAsyncThrottler()

```ts
function injectAsyncThrottler<TFn, TSelected>(
   fn, 
   options, 
selector): AngularAsyncThrottler<TFn, TSelected>;
```

Defined in: [angular-pacer/src/async-throttler/injectAsyncThrottler.ts:71](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-throttler/injectAsyncThrottler.ts#L71)

An Angular function that creates and manages an AsyncThrottler instance.

This is a lower-level function that provides direct access to the AsyncThrottler's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async throttling functionality with promise support, error handling,
retry capabilities, and abort support.

The throttler will execute the function at most once within the specified wait time.

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

`AsyncThrottlerOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncThrottler`](../interfaces/AngularAsyncThrottler.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const throttler = injectAsyncThrottler(
  async (data: Data) => {
    const response = await fetch('/api/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  { wait: 1000 }
);

// In an event handler
const handleUpdate = async (data: Data) => {
  const result = await throttler.maybeExecute(data);
  console.log('Update result:', result);
};
```
