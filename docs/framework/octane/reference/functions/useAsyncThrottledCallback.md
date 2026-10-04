---
id: useAsyncThrottledCallback
title: useAsyncThrottledCallback
---

```ts
function useAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-throttler/useAsyncThrottledCallback.ts:13](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-throttler/useAsyncThrottledCallback.ts#L13)

Returns a stable throttled callback with the same options and cleanup as useAsyncThrottler.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneAsyncThrottlerOptions`](../interfaces/OctaneAsyncThrottlerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the throttled function. The execution behavior depends on the throttler options:

- If enough time has passed since the last execution (>= wait period):
  - With leading=true: Executes immediately
  - With leading=false: Waits for the next trailing execution

- If within the wait period:
  - With trailing=true: Schedules execution for end of wait period
  - With trailing=false: Drops the execution

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

### Example

```ts
const throttled = new AsyncThrottler(fn, { wait: 1000 });

// First call executes immediately
await throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
await throttled.maybeExecute('c', 'd');
```
