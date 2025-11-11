---
id: AsyncRateLimiter
title: AsyncRateLimiter
---

# Class: AsyncRateLimiter\<TFn\>

Defined in: [async-rate-limiter.ts:245](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L245)

A class that creates an async rate-limited function.

Async vs Sync Versions:
The async version provides advanced features over the sync RateLimiter:
- Returns promises that can be awaited for rate-limited function results
- Built-in retry support via AsyncRetryer integration
- Abort support to cancel in-flight executions
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts, rejection counts)
- More sophisticated window management with automatic cleanup

The sync RateLimiter is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Rate Limiting?
Rate limiting allows a function to execute up to a limit within a time window,
then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
all executions happen immediately, followed by a complete block.

Window Types:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

When to Use Rate Limiting:
Rate limiting is best used for hard API limits or resource constraints. For UI updates or
smoothing out frequent events, throttling or debouncing usually provide better user experience.
- Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
- Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the rate limiter
- `initialState` can be a partial state object
- Use `onSuccess` callback to react to successful function execution and implement custom logic
- Use `onError` callback to react to function execution errors and implement custom error handling
- Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
- Use `onReject` callback to react to executions being rejected when rate limit is exceeded
- The state includes execution times, success/error counts, and current execution status
- State can be accessed via `asyncRateLimiter.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `asyncRateLimiter.state`

Error Handling:
- If an `onError` handler is provided, it will be called with the error and rate limiter instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying AsyncRateLimiter instance
- Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler

## Example

```ts
const rateLimiter = new AsyncRateLimiter(
  async (id: string) => await api.getData(id),
  {
    limit: 5,
    window: 1000,
    windowType: 'sliding',
    onError: (error) => {
      console.error('API call failed:', error);
    },
    onReject: (limiter) => {
      console.log(`Rate limit exceeded. Try again in ${limiter.getMsUntilNextWindow()}ms`);
    }
  }
);

// Will execute immediately until limit reached, then block
// Returns the API response directly
const data = await rateLimiter.maybeExecute('123');
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

## Constructors

### Constructor

```ts
new AsyncRateLimiter<TFn>(fn, initialOptions): AsyncRateLimiter<TFn>;
```

Defined in: [async-rate-limiter.ts:254](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L254)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`AsyncRateLimiterOptions`](../../interfaces/AsyncRateLimiterOptions.md)\<`TFn`\>

#### Returns

`AsyncRateLimiter`\<`TFn`\>

## Properties

### asyncRetryers

```ts
asyncRetryers: Map<number, AsyncRetryer<TFn>>;
```

Defined in: [async-rate-limiter.ts:251](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L251)

***

### fn

```ts
fn: TFn;
```

Defined in: [async-rate-limiter.ts:255](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L255)

***

### key

```ts
key: string;
```

Defined in: [async-rate-limiter.ts:249](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L249)

***

### options

```ts
options: AsyncRateLimiterOptions<TFn>;
```

Defined in: [async-rate-limiter.ts:250](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L250)

***

### store

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [async-rate-limiter.ts:246](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L246)

## Methods

### \_emit()

```ts
_emit(): void;
```

Defined in: [async-rate-limiter.ts:279](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L279)

Emits a change event for the async rate limiter instance. Mostly useful for devtools.

#### Returns

`void`

***

### abort()

```ts
abort(): void;
```

Defined in: [async-rate-limiter.ts:538](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L538)

Aborts all ongoing executions with the internal abort controllers.
Does NOT clear out the execution times or reset the rate limiter.

#### Returns

`void`

***

### getAbortSignal()

```ts
getAbortSignal(maybeExecuteCount?): AbortSignal | null;
```

Defined in: [async-rate-limiter.ts:528](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L528)

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
const rateLimiter = new AsyncRateLimiter(
  async (userId: string) => {
    const signal = rateLimiter.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/users/${userId}`, { signal })
      return response.json()
    }
  },
  { limit: 5, window: 1000 }
)
```

***

### getMsUntilNextWindow()

```ts
getMsUntilNextWindow(): number;
```

Defined in: [async-rate-limiter.ts:500](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L500)

Returns the number of milliseconds until the next execution will be possible
For fixed windows, this is the time until the current window resets
For sliding windows, this is the time until the oldest execution expires

#### Returns

`number`

***

### getRemainingInWindow()

```ts
getRemainingInWindow(): number;
```

Defined in: [async-rate-limiter.ts:490](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L490)

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

***

### maybeExecute()

```ts
maybeExecute(...args): Promise<ReturnType<TFn> | undefined>;
```

Defined in: [async-rate-limiter.ts:357](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L357)

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

Error Handling:
- If the rate-limited function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

#### Parameters

##### args

...`Parameters`\<`TFn`\>

#### Returns

`Promise`\<`ReturnType`\<`TFn`\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

#### Throws

The error from the rate-limited function if no onError handler is configured

#### Example

```ts
const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return a promise that resolves with the result
const result = await rateLimiter.maybeExecute('arg1', 'arg2');

// Additional calls within the window will return undefined
const result2 = await rateLimiter.maybeExecute('arg1', 'arg2'); // undefined
```

***

### reset()

```ts
reset(): void;
```

Defined in: [async-rate-limiter.ts:549](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L549)

Resets the rate limiter state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-rate-limiter.ts:284](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L284)

Updates the async rate limiter options

#### Parameters

##### newOptions

`Partial`\<[`AsyncRateLimiterOptions`](../../interfaces/AsyncRateLimiterOptions.md)\<`TFn`\>\>

#### Returns

`void`
