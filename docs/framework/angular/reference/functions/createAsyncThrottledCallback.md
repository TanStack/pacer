---
id: createAsyncThrottledCallback
title: createAsyncThrottledCallback
---

# Function: createAsyncThrottledCallback()

```ts
function createAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [angular-pacer/src/async-throttler/createAsyncThrottledCallback.ts:41](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-throttler/createAsyncThrottledCallback.ts#L41)

An Angular function that creates an async throttled version of a callback function.
This function is essentially a wrapper around `createAsyncThrottler` that provides
a simplified API for basic async throttling needs.

The throttled function will execute at most once within the specified wait time.

This function provides a simpler API compared to `createAsyncThrottler`, making it ideal for basic
async throttling needs. However, it does not expose the underlying AsyncThrottler instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution counts
- Error handling callbacks
- Retry support

Consider using the `createAsyncThrottler` function instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

`AsyncThrottlerOptions`\<`TFn`\>

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

```ts
// Throttle an async update handler
const handleUpdate = createAsyncThrottledCallback(
  async (data: Data) => {
    const response = await fetch('/api/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },
  { wait: 1000 }
);

// Use in an event handler
const result = await handleUpdate(updateData);
```
