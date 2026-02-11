---
id: AsyncRetryer
title: AsyncRetryer
---

# Class: AsyncRetryer\<TFn\>

Defined in: [async-retryer.ts:296](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L296)

Provides robust retry functionality for asynchronous functions, supporting configurable backoff strategies,
attempt limits, timeout controls, and detailed state management. The AsyncRetryer class is designed to help you reliably
execute async operations that may fail intermittently, such as network requests or database operations,
by automatically retrying them according to your chosen policy.

## Retrying Concepts

- **Retrying**: Automatically re-executes a failed async function up to a specified number of attempts.
  Useful for handling transient errors (e.g., network flakiness, rate limits, temporary server issues).
- **Backoff Strategies**: Controls the delay between retry attempts (default: `'exponential'`):
  - `'exponential'`: Wait time doubles with each attempt (1s, 2s, 4s, ...) - **DEFAULT**
  - `'linear'`: Wait time increases linearly (1s, 2s, 3s, ...)
  - `'fixed'`: Waits a constant amount of time (`baseWait`) between each attempt
- **Jitter**: Adds randomness to retry delays to prevent thundering herd problems (default: `0`).
  Set to a value between 0-1 to apply that percentage of random variation to each delay.
- **Max Wait**: Caps the maximum wait time between retries (default: `Infinity`).
  Useful for preventing exponential backoff from growing too large (e.g., cap at 30s even if exponential would be 64s).
- **Timeout Controls**: Set limits on execution time to prevent hanging operations:
  - `maxExecutionTime`: Maximum time for a single function call (default: `Infinity`)
  - `maxTotalExecutionTime`: Maximum time for the entire retry operation (default: `Infinity`)
- **Abort & Cancellation**: Supports cancellation via an internal `AbortController`. Call `abort()` to stop retries.
  Use `getAbortSignal()` to make your async function actually cancellable (e.g., with fetch requests).

## State Management

Uses TanStack Store for fine-grained reactivity. State can be accessed via the `store.state` property.

Available state properties:
- `currentAttempt`: The current retry attempt number (0 when not executing)
- `executionCount`: Total number of completed executions (successful or failed)
- `isExecuting`: Whether the retryer is currently executing the function
- `lastError`: The most recent error encountered during execution
- `lastExecutionTime`: Timestamp of the last execution completion in milliseconds
- `lastResult`: The result from the most recent successful execution
- `status`: Current execution status ('disabled' | 'idle' | 'executing' | 'retrying')
- `totalExecutionTime`: Total time spent executing (including retries) in milliseconds

## Error Handling

The `throwOnError` option controls when errors are thrown (default: `'last'`):
- `'last'`: Only throws the final error after all retries are exhausted - **DEFAULT**
- `true`: Throws every error immediately (disables retrying)
- `false`: Never throws errors, returns `undefined` instead

Callbacks for lifecycle management:
- `onAbort`: Called when execution is aborted (manually or due to timeouts)
- `onError`: Called for every error (including during retries)
- `onLastError`: Called only for the final error after all retries fail
- `onRetry`: Called before each retry attempt
- `onSettled`: Called after execution completes (success or failure) of each attempt
- `onSuccess`: Called when execution succeeds
- `onExecutionTimeout`: Called when a single execution attempt times out
- `onTotalExecutionTimeout`: Called when the total execution time times out

## Usage

- Use for async operations that may fail transiently and benefit from retrying.
- Configure `maxAttempts`, `backoff`, `baseWait`, `maxWait`, and `jitter` to control retry behavior.
- Set `maxExecutionTime` and `maxTotalExecutionTime` to prevent hanging operations.
- Use `onAbort`, `onError`, `onLastError`, `onRetry`, `onSettled`, `onSuccess`, `onExecutionTimeout`, and `onTotalExecutionTimeout` for custom side effects.
- Call `abort()` to cancel ongoing execution and pending retries.
- Call `reset()` to reset state and cancel execution.
- Use `getAbortSignal()` to make your async function cancellable.
- Use dynamic options (functions) for `maxAttempts`, `baseWait`, and `enabled` based on retryer state.

**Important:** This class is designed for single-use execution. Calling `execute()` multiple times
on the same instance will abort previous executions. For multiple calls, create a new instance
each time.

## Example

```typescript
// Retry a fetch operation up to 5 times with exponential backoff, jitter, and timeouts
const retryer = new AsyncRetryer(async (url: string) => {
  const signal = retryer.getAbortSignal()
  return await fetch(url, { signal })
}, {
  maxAttempts: 5,
  backoff: 'exponential',
  baseWait: 1000,
  jitter: 0.1, // Add 10% random variation to prevent thundering herd
  maxExecutionTime: 5000, // Abort individual calls after 5 seconds
  maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
  onRetry: (attempt, error) => console.log(`Retry attempt ${attempt} after error:`, error),
  onSuccess: (result) => console.log('Success:', result),
  onError: (error) => console.error('Error:', error),
  onLastError: (error) => console.error('All retries failed:', error),
})

const result = await retryer.execute('/api/data')
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

The async function type to be retried.

## Constructors

### Constructor

```ts
new AsyncRetryer<TFn>(fn, initialOptions): AsyncRetryer<TFn>;
```

Defined in: [async-retryer.ts:309](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L309)

Creates a new AsyncRetryer instance

#### Parameters

##### fn

`TFn`

The async function to retry

##### initialOptions

[`AsyncRetryerOptions`](../interfaces/AsyncRetryerOptions.md)\<`TFn`\> = `{}`

Configuration options for the retryer

#### Returns

`AsyncRetryer`\<`TFn`\>

## Properties

### fn

```ts
fn: TFn;
```

Defined in: [async-retryer.ts:310](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L310)

The async function to retry

***

### key

```ts
key: string | undefined;
```

Defined in: [async-retryer.ts:300](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L300)

***

### options

```ts
options: AsyncRetryerOptions<TFn> & Omit<Required<AsyncRetryerOptions<any>>, 
  | "initialState"
  | "onError"
  | "onSettled"
  | "onSuccess"
  | "key"
  | "onAbort"
  | "onLastError"
  | "onRetry"
  | "onExecutionTimeout"
| "onTotalExecutionTimeout">;
```

Defined in: [async-retryer.ts:301](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L301)

***

### store

```ts
readonly store: Store<Readonly<AsyncRetryerState<TFn>>>;
```

Defined in: [async-retryer.ts:297](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L297)

## Methods

### abort()

```ts
abort(reason): void;
```

Defined in: [async-retryer.ts:619](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L619)

Cancels the current execution and any pending retries

#### Parameters

##### reason

The reason for the abort (defaults to 'manual')

`"manual"` | `"execution-timeout"` | `"total-timeout"` | `"new-execution"`

#### Returns

`void`

***

### execute()

```ts
execute(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-retryer.ts:426](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L426)

Executes the function with retry logic

#### Parameters

##### args

...`Parameters`\<`TFn`\>

Arguments to pass to the function

#### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

The function result, or undefined if disabled or all retries failed (when throwOnError is false)

#### Throws

The last error if throwOnError is true and all retries fail

***

### getAbortSignal()

```ts
getAbortSignal(): AbortSignal | null;
```

Defined in: [async-retryer.ts:611](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L611)

Returns the current AbortSignal for the executing operation.
Use this signal in your async function to make it cancellable.
Returns null when not currently executing.

#### Returns

`AbortSignal` \| `null`

#### Example

```typescript
const retryer = new AsyncRetryer(async (userId: string) => {
  const signal = retryer.getAbortSignal()
  if (signal) {
    return fetch(`/api/users/${userId}`, { signal })
  }
  return fetch(`/api/users/${userId}`)
})

// Abort will now actually cancel the fetch
retryer.abort()
```

***

### reset()

```ts
reset(): void;
```

Defined in: [async-retryer.ts:639](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L639)

Resets the retryer to its initial state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-retryer.ts:336](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L336)

Updates the retryer options

#### Parameters

##### newOptions

`Partial`\<[`AsyncRetryerOptions`](../interfaces/AsyncRetryerOptions.md)\<`TFn`\>\>

Partial options to merge with existing options

#### Returns

`void`
