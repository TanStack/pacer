---
id: createThrottledCallback
title: createThrottledCallback
---

```ts
function createThrottledCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [packages/svelte-pacer/src/throttler/createThrottledCallback.ts:9](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/throttler/createThrottledCallback.ts#L9)

Returns a stable throttled callback with the same options and cleanup as createThrottler.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

[`SveltePacerOptions`](../type-aliases/SveltePacerOptions.md)\<[`SvelteThrottlerOptions`](../interfaces/SvelteThrottlerOptions.md)\<`TFn`, \{
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
