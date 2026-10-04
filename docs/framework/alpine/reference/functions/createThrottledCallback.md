---
id: createThrottledCallback
title: createThrottledCallback
---

```ts
function createThrottledCallback<TFn>(
   scope,
   fn,
   options): (...args) => void;
```

Defined in: [throttler/createThrottledCallback.ts:10](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/throttler/createThrottledCallback.ts#L10)

Returns a stable throttled callback with the same options and cleanup as createThrottler.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### scope

[`PacerScope`](../interfaces/PacerScope.md)

### fn

`TFn`

### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`TFn`, \{
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
