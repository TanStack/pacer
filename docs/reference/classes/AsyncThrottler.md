---
id: AsyncThrottler
title: AsyncThrottler
---

# Class: AsyncThrottler\<TFn\>

Defined in: [async-throttler.ts:230](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L230)

A class that creates an async throttled function.

Async vs Sync Versions:
The async version provides advanced features over the sync Throttler:
- Returns promises that can be awaited for throttled function results
- Built-in retry support via AsyncRetryer integration
- Abort support to cancel in-flight executions
- Cancel support to prevent pending executions from starting
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts)
- Waits for ongoing executions to complete before scheduling the next one

The sync Throttler is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Throttling?
Throttling limits how often a function can be executed, allowing only one execution within a specified time window.
Unlike debouncing which resets the delay timer on each call, throttling ensures the function executes at a
regular interval regardless of how often it's called.

This is useful for rate-limiting API calls, handling scroll/resize events, or any scenario where you want to
ensure a maximum execution frequency.

Error Handling:
- If an `onError` handler is provided, it will be called with the error and throttler instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncThrottler instance

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the async throttler
- Use `onSuccess` callback to react to successful function execution and implement custom logic
- Use `onError` callback to react to function execution errors and implement custom error handling
- Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
- The state includes error count, execution status, last execution time, and success/settle counts
- State can be accessed via `asyncThrottler.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `asyncThrottler.state`

## Example

```ts
const throttler = new AsyncThrottler(async (value: string) => {
  const result = await saveToAPI(value);
  return result; // Return value is preserved
}, {
  wait: 1000,
  onError: (error) => {
    console.error('API call failed:', error);
  }
});

// Will only execute once per second no matter how often called
// Returns the API response directly
const result = await throttler.maybeExecute(inputElement.value);
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Constructors

### Constructor

```ts
new AsyncThrottler<TFn>(fn, initialOptions): AsyncThrottler<TFn>;
```

Defined in: [async-throttler.ts:242](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L242)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`AsyncThrottlerOptions`](../interfaces/AsyncThrottlerOptions.md)\<`TFn`\>

#### Returns

`AsyncThrottler`\<`TFn`\>

## Properties

### asyncRetryers

```ts
asyncRetryers: Map<number, AsyncRetryer<TFn>>;
```

Defined in: [async-throttler.ts:236](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L236)

***

### fn

```ts
fn: TFn;
```

Defined in: [async-throttler.ts:243](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L243)

***

### key

```ts
key: string | undefined;
```

Defined in: [async-throttler.ts:234](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L234)

***

### options

```ts
options: AsyncThrottlerOptions<TFn>;
```

Defined in: [async-throttler.ts:235](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L235)

***

### store

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [async-throttler.ts:231](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L231)

## Methods

### abort()

```ts
abort(): void;
```

Defined in: [async-throttler.ts:529](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L529)

Aborts all ongoing executions with the internal abort controllers.
Does NOT cancel any pending execution that have not started yet.

#### Returns

`void`

***

### cancel()

```ts
cancel(): void;
```

Defined in: [async-throttler.ts:539](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L539)

Cancels any pending execution that have not started yet.
Does NOT abort any execution already in progress.

#### Returns

`void`

***

### flush()

```ts
flush(): Promise<ReturnType<TFn> | undefined>;
```

Defined in: [async-throttler.ts:458](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L458)

Processes the current pending execution immediately

#### Returns

`Promise`\<`ReturnType`\<`TFn`\> \| `undefined`\>

***

### getAbortSignal()

```ts
getAbortSignal(maybeExecuteCount?): AbortSignal | null;
```

Defined in: [async-throttler.ts:519](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L519)

Returns the AbortSignal for a specific execution.
If no maybeExecuteCount is provided, returns the signal for the most recent execution.
Returns null if no execution is found or not currently executing.

#### Parameters

##### maybeExecuteCount?

`number`

Optional specific execution to get signal for

#### Returns

`AbortSignal` \| `null`

#### Example

```typescript
const throttler = new AsyncThrottler(
  async (data: string) => {
    const signal = throttler.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: data,
        signal
      })
      return response.json()
    }
  },
  { wait: 1000 }
)
```

***

### maybeExecute()

```ts
maybeExecute(...args): Promise<ReturnType<TFn> | undefined>;
```

Defined in: [async-throttler.ts:334](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L334)

Attempts to execute the throttled function. The execution behavior depends on the throttler options:

- If enough time has passed since the last execution (>= wait period):
  - With leading=true: Executes immediately
  - With leading=false: Waits for the next trailing execution

- If within the wait period:
  - With trailing=true: Schedules execution for end of wait period
  - With trailing=false: Drops the execution

#### Parameters

##### args

...`Parameters`\<`TFn`\>

#### Returns

`Promise`\<`ReturnType`\<`TFn`\> \| `undefined`\>

#### Example

```ts
const throttled = new AsyncThrottler(fn, { wait: 1000 });

// First call executes immediately
await throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
await throttled.maybeExecute('c', 'd');
```

***

### reset()

```ts
reset(): void;
```

Defined in: [async-throttler.ts:553](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L553)

Resets the debouncer state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-throttler.ts:266](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L266)

Updates the async throttler options

#### Parameters

##### newOptions

`Partial`\<[`AsyncThrottlerOptions`](../interfaces/AsyncThrottlerOptions.md)\<`TFn`\>\>

#### Returns

`void`
