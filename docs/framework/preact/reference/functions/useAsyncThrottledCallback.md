---
id: useAsyncThrottledCallback
title: useAsyncThrottledCallback
---

# Function: useAsyncThrottledCallback()

```ts
function useAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [preact-pacer/src/async-throttler/useAsyncThrottledCallback.ts:43](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/async-throttler/useAsyncThrottledCallback.ts#L43)

A Preact hook that creates a throttled version of an async callback function.
This hook is a convenient wrapper around the `useAsyncThrottler` hook,
providing a stable, throttled async function reference for use in Preact components.

The throttled async function will execute at most once within the specified wait time period,
regardless of how many times it is called. Calls made during the wait period reschedule a
single trailing execution with the latest arguments when `trailing` is enabled (the default).
The most recent call's promise resolves or rejects with the trailing execution's result;
each earlier call's promise resolves immediately with the most recent previous result (or
`undefined` if nothing has executed yet), as does every call when the throttler is disabled.

This hook provides a simpler API compared to `useAsyncThrottler`, making it ideal for basic
async throttling needs. However, it does not expose the underlying AsyncThrottler instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution/error state
- Custom useCallback dependencies

Consider using the `useAsyncThrottler` hook instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

[`PreactAsyncThrottlerOptions`](../interfaces/PreactAsyncThrottlerOptions.md)\<`TFn`, \{
\}\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

## Example

```tsx
// Throttle an async API call
const handleApiCall = useAsyncThrottledCallback(async (data) => {
  const result = await sendDataToServer(data);
  return result;
}, {
  wait: 200 // Execute at most once every 200ms
});

// Use in an event handler
<button onClick={() => handleApiCall(formData)}>Send</button>
```
