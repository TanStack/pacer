---
id: AsyncThrottler
title: AsyncThrottler
---

Defined in: [async-throttler.ts:231](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L231)

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

Defined in: [async-throttler.ts:245](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L245)

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

Defined in: [async-throttler.ts:237](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L237)

***

### fn

```ts
fn: TFn;
```

Defined in: [async-throttler.ts:246](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L246)

***

### key

```ts
key: string | undefined;
```

Defined in: [async-throttler.ts:235](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L235)

***

### options

```ts
options: AsyncThrottlerOptions<TFn>;
```

Defined in: [async-throttler.ts:236](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L236)

***

### store

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [async-throttler.ts:232](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L232)

## Methods

### abort()

```ts
abort(): void;
```

Defined in: [async-throttler.ts:552](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L552)

Aborts all ongoing executions with the internal abort controllers.
Does NOT cancel any pending execution that have not started yet.

#### Returns

`void`

***

### cancel()

```ts
cancel(): void;
```

Defined in: [async-throttler.ts:563](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L563)

Cancels any pending execution that have not started yet.
Does NOT abort any execution already in progress.

#### Returns

`void`

***

### flush()

```ts
flush(): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-throttler.ts:478](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L478)

Processes the current pending execution immediately
The original maybeExecute call and flush share the execution's result or error.

#### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

***

### getAbortSignal()

```ts
getAbortSignal(maybeExecuteCount?): AbortSignal | null;
```

Defined in: [async-throttler.ts:540](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L540)

Returns the AbortSignal for a specific execution.
If no maybeExecuteCount is provided, returns the signal for the latest active execution.
Capture the signal before awaiting work, since another execution may start meanwhile.
Explicit counts refer to executions started since the most recent reset().
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
maybeExecute(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-throttler.ts:341](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L341)

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

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

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

Defined in: [async-throttler.ts:576](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L576)

Resets counters and pending state without aborting active executions.
Active executions remain abortable and keep isExecuting true until they settle.
Explicit execution count lookups start over after reset().

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-throttler.ts:273](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L273)

Updates the async throttler options

#### Parameters

##### newOptions

`Partial`\<[`AsyncThrottlerOptions`](../interfaces/AsyncThrottlerOptions.md)\<`TFn`\>\>

#### Returns

`void`
