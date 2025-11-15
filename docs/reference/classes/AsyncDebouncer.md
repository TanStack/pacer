---
id: AsyncDebouncer
title: AsyncDebouncer
---

# Class: AsyncDebouncer\<TFn\>

Defined in: [async-debouncer.ts:218](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L218)

A class that creates an async debounced function.

Async vs Sync Versions:
The async version provides advanced features over the sync Debouncer:
- Returns promises that can be awaited for debounced function results
- Built-in retry support via AsyncRetryer integration
- Abort support to cancel in-flight executions
- Cancel support to prevent pending executions from starting
- Comprehensive error handling with onError callbacks and throwOnError control
- Detailed execution tracking (success/error/settle counts)

The sync Debouncer is lighter weight and simpler when you don't need async features,
return values, or execution control.

What is Debouncing?
Debouncing ensures that a function is only executed after a specified delay has passed since its last invocation.
Each new invocation resets the delay timer. This is useful for handling frequent events like window resizing
or input changes where you only want to execute the handler after the events have stopped occurring.

Unlike throttling which allows execution at regular intervals, debouncing prevents any execution until
the function stops being called for the specified delay period.

Error Handling:
- If an `onError` handler is provided, it will be called with the error and debouncer instance
- If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
- If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
- Both onError and throwOnError can be used together - the handler will be called before any error is thrown
- The error state can be checked using the underlying store

State Management:
- The debouncer uses a reactive store for state management
- Use `initialState` to provide initial state values when creating the async debouncer
- The state includes canLeadingExecute, error count, execution status, and success/settle counts
- State can be accessed via the `store` property and its `state` getter
- The store is reactive and will notify subscribers of state changes

## Example

```ts
const asyncDebouncer = new AsyncDebouncer(async (value: string) => {
  const results = await searchAPI(value);
  return results; // Return value is preserved
}, {
  wait: 500,
  onError: (error) => {
    console.error('Search failed:', error);
  }
});

// Called on each keystroke but only executes after 500ms of no typing
// Returns the API response directly
const results = await asyncDebouncer.maybeExecute(inputElement.value);
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

## Constructors

### Constructor

```ts
new AsyncDebouncer<TFn>(fn, initialOptions): AsyncDebouncer<TFn>;
```

Defined in: [async-debouncer.ts:230](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L230)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`AsyncDebouncerOptions`](../../interfaces/AsyncDebouncerOptions.md)\<`TFn`\>

#### Returns

`AsyncDebouncer`\<`TFn`\>

## Properties

### asyncRetryers

```ts
asyncRetryers: Map<number, AsyncRetryer<TFn>>;
```

Defined in: [async-debouncer.ts:224](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L224)

***

### fn

```ts
fn: TFn;
```

Defined in: [async-debouncer.ts:231](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L231)

***

### key

```ts
key: string | undefined;
```

Defined in: [async-debouncer.ts:222](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L222)

***

### options

```ts
options: AsyncDebouncerOptions<TFn>;
```

Defined in: [async-debouncer.ts:223](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L223)

***

### store

```ts
readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>;
```

Defined in: [async-debouncer.ts:219](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L219)

## Methods

### abort()

```ts
abort(): void;
```

Defined in: [async-debouncer.ts:465](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L465)

Aborts all ongoing executions with the internal abort controllers.
Does NOT cancel any pending execution that have not started yet.

#### Returns

`void`

***

### cancel()

```ts
cancel(): void;
```

Defined in: [async-debouncer.ts:477](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L477)

Cancels any pending execution that have not started yet.
Does NOT abort any execution already in progress.

#### Returns

`void`

***

### flush()

```ts
flush(): Promise<ReturnType<TFn> | undefined>;
```

Defined in: [async-debouncer.ts:400](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L400)

Processes the current pending execution immediately

#### Returns

`Promise`\<`ReturnType`\<`TFn`\> \| `undefined`\>

***

### getAbortSignal()

```ts
getAbortSignal(maybeExecuteCount?): AbortSignal | null;
```

Defined in: [async-debouncer.ts:455](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L455)

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
const debouncer = new AsyncDebouncer(
  async (searchTerm: string) => {
    const signal = debouncer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/search?q=${searchTerm}`, { signal })
      return response.json()
    }
  },
  { wait: 300 }
)
```

***

### maybeExecute()

```ts
maybeExecute(...args): Promise<ReturnType<TFn> | undefined>;
```

Defined in: [async-debouncer.ts:314](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L314)

Attempts to execute the debounced function.
If a call is already in progress, it will be queued.

Error Handling:
- If the debounced function throws and no `onError` handler is configured,
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

The error from the debounced function if no onError handler is configured

***

### reset()

```ts
reset(): void;
```

Defined in: [async-debouncer.ts:485](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L485)

Resets the debouncer state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [async-debouncer.ts:254](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-debouncer.ts#L254)

Updates the async debouncer options

#### Parameters

##### newOptions

`Partial`\<[`AsyncDebouncerOptions`](../../interfaces/AsyncDebouncerOptions.md)\<`TFn`\>\>

#### Returns

`void`
