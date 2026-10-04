---
id: useThrottledCallback
title: useThrottledCallback
---

```ts
function useThrottledCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [throttler/useThrottledCallback.ts:10](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/throttler/useThrottledCallback.ts#L10)

Returns a stable throttled callback with the same options and cleanup as useThrottler.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`OctanePacerOptions`](../type-aliases/OctanePacerOptions.md)\<[`OctaneThrottlerOptions`](../interfaces/OctaneThrottlerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

```ts
(...args): void;
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

`void`

### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```
