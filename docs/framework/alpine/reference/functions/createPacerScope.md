---
id: createPacerScope
title: createPacerScope
---

```ts
function createPacerScope(defaultOptions?): object;
```

Defined in: [provider/createPacerScope.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/createPacerScope.ts#L34)

Creates typed Pacer factories sharing an Alpine lifecycle and reactive defaults.

## Parameters

### defaultOptions?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)\> = `{}`

## Returns

`object`

### destroy

```ts
destroy: () => void = scope.destroy;
```

#### Returns

`void`

### destroyed

#### Get Signature

```ts
get destroyed(): boolean;
```

##### Returns

`boolean`

### createAsyncBatchedCallback()

```ts
createAsyncBatchedCallback<TValue>(fn, options): (item) => Promise<any>;
```

#### Type Parameters

##### TValue

`TValue`

#### Parameters

##### fn

(`items`) => `Promise`\<`any`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncBatcherOptions`](../interfaces/AlpineAsyncBatcherOptions.md)\<`TValue`, \{
\}\>\>

#### Returns

```ts
(item): Promise<any>;
```

Adds an item to the async batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`Promise`\<`any`\>

The result from the batch function, or undefined if an error occurred and was handled by onError

##### Throws

The error from the batch function if no onError handler is configured or throwOnError is true

### createAsyncBatcher()

```ts
createAsyncBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineAsyncBatcher<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`items`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncBatcherOptions`](../interfaces/AlpineAsyncBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncBatcher`](../interfaces/AlpineAsyncBatcher.md)\<`TValue`, `TSelected`\>

### createAsyncDebouncedCallback()

```ts
createAsyncDebouncedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncDebouncerOptions`](../interfaces/AlpineAsyncDebouncerOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the debounced function.
If a call is already in progress, it will be queued.

Error Handling:
- If the debounced function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

##### Throws

The error from the debounced function if no onError handler is configured

### createAsyncDebouncer()

```ts
createAsyncDebouncer<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncDebouncer<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncDebouncerOptions`](../interfaces/AlpineAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncDebouncer`](../interfaces/AlpineAsyncDebouncer.md)\<`TFn`, `TSelected`\>

### createAsyncQueuedState()

```ts
createAsyncQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], AlpineAsyncQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` *extends* `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`AsyncQueuerState`\<`TValue`\>, `"items"`\>

#### Parameters

##### fn

(`item`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncQueuerOptions`](../interfaces/AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[() => `TValue`[], [`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>\]

### createAsyncQueuer()

```ts
createAsyncQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineAsyncQueuer<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`item`) => `Promise`\<`any`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncQueuerOptions`](../interfaces/AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncQueuer`](../interfaces/AlpineAsyncQueuer.md)\<`TValue`, `TSelected`\>

### createAsyncRateLimitedCallback()

```ts
createAsyncRateLimitedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncRateLimiterOptions`](../interfaces/AlpineAsyncRateLimiterOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

Error Handling:
- If the rate-limited function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

##### Throws

The error from the rate-limited function if no onError handler is configured

##### Example

```ts
const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return a promise that resolves with the result
const result = await rateLimiter.maybeExecute('arg1', 'arg2');

// Additional calls within the window will return undefined
const result2 = await rateLimiter.maybeExecute('arg1', 'arg2'); // undefined
```

### createAsyncRateLimiter()

```ts
createAsyncRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncRateLimiter<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncRateLimiterOptions`](../interfaces/AlpineAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncRateLimiter`](../interfaces/AlpineAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

### createAsyncThrottledCallback()

```ts
createAsyncThrottledCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncThrottlerOptions`](../interfaces/AlpineAsyncThrottlerOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

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

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

##### Example

```ts
const throttled = new AsyncThrottler(fn, { wait: 1000 });

// First call executes immediately
await throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
await throttled.maybeExecute('c', 'd');
```

### createAsyncThrottler()

```ts
createAsyncThrottler<TFn, TSelected>(
   fn,
   options,
selector?): AlpineAsyncThrottler<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyAsyncFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineAsyncThrottlerOptions`](../interfaces/AlpineAsyncThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineAsyncThrottler`](../interfaces/AlpineAsyncThrottler.md)\<`TFn`, `TSelected`\>

### createBatchedCallback()

```ts
createBatchedCallback<TValue>(fn, options): (item) => void;
```

#### Type Parameters

##### TValue

`TValue`

#### Parameters

##### fn

(`items`) => `void`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineBatcherOptions`](../interfaces/AlpineBatcherOptions.md)\<`TValue`, \{
\}\>\>

#### Returns

```ts
(item): void;
```

Adds an item to the batcher
If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed

##### Parameters

###### item

`TValue`

##### Returns

`void`

### createBatcher()

```ts
createBatcher<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineBatcher<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`items`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineBatcherOptions`](../interfaces/AlpineBatcherOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineBatcher`](../interfaces/AlpineBatcher.md)\<`TValue`, `TSelected`\>

### createDebouncedCallback()

```ts
createDebouncedCallback<TFn>(fn, options): (...args) => void;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

```ts
(...args): void;
```

Attempts to execute the debounced function
If a call is already in progress, it will be queued

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`void`

### createDebouncedState()

```ts
createDebouncedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createDebouncedValue()

```ts
createDebouncedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createDebouncer()

```ts
createDebouncer<TFn, TSelected>(
   fn,
   options,
selector?): AlpineDebouncer<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineDebouncerOptions`](../interfaces/AlpineDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineDebouncer`](../interfaces/AlpineDebouncer.md)\<`TFn`, `TSelected`\>

### createQueuedState()

```ts
createQueuedState<TValue, TSelected>(
   fn,
   options?,
   selector?): [() => TValue[], (item, position?, runOnItemsChange?) => boolean, AlpineQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` *extends* `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\> = `Pick`\<`QueuerState`\<`TValue`\>, `"items"`\>

#### Parameters

##### fn

(`item`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[() => `TValue`[], (`item`, `position?`, `runOnItemsChange?`) => `boolean`, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]

### createQueuedValue()

```ts
createQueuedValue<TValue, TSelected>(
   source,
   options?,
   selector?): [CellValue<TValue>, AlpineQueuer<TValue, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>\]

### createQueuer()

```ts
createQueuer<TValue, TSelected>(
   fn,
   options?,
selector?): AlpineQueuer<TValue, TSelected>;
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

(`item`) => `void`

##### options?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineQueuerOptions`](../interfaces/AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\> = `{}`

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineQueuer`](../interfaces/AlpineQueuer.md)\<`TValue`, `TSelected`\>

### createRateLimitedCallback()

```ts
createRateLimitedCallback<TFn>(fn, options): (...args) => boolean;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

```ts
(...args): boolean;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`boolean`

##### Example

```ts
const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return true
rateLimiter.maybeExecute('arg1', 'arg2'); // true

// Additional calls within the window will return false
rateLimiter.maybeExecute('arg1', 'arg2'); // false
```

### createRateLimitedState()

```ts
createRateLimitedState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createRateLimitedValue()

```ts
createRateLimitedValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createRateLimiter()

```ts
createRateLimiter<TFn, TSelected>(
   fn,
   options,
selector?): AlpineRateLimiter<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineRateLimiterOptions`](../interfaces/AlpineRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineRateLimiter`](../interfaces/AlpineRateLimiter.md)\<`TFn`, `TSelected`\>

### createThrottledCallback()

```ts
createThrottledCallback<TFn>(fn, options): (...args) => void;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`TFn`, \{
\}\>\>

#### Returns

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

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`void`

##### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

### createThrottledState()

```ts
createThrottledState<TValue, TSelected>(
   initialValue,
   options,
   selector?): [CellValue<TValue>, SetValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### initialValue

`TValue`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, `SetValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createThrottledValue()

```ts
createThrottledValue<TValue, TSelected>(
   source,
   options,
   selector?): [CellValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>];
```

#### Type Parameters

##### TValue

`TValue`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### source

`ValueSource`\<`TValue`\>

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

\[`CellValue`\<`TValue`\>, [`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`SetValue`\<`TValue`\>, `TSelected`\>\]

### createThrottler()

```ts
createThrottler<TFn, TSelected>(
   fn,
   options,
selector?): AlpineThrottler<TFn, TSelected>;
```

#### Type Parameters

##### TFn

`TFn` *extends* `AnyFunction`

##### TSelected

`TSelected` = \{
\}

#### Parameters

##### fn

`TFn`

##### options

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`AlpineThrottlerOptions`](../interfaces/AlpineThrottlerOptions.md)\<`TFn`, `TSelected`\>\>

##### selector?

(`state`) => `TSelected`

#### Returns

[`AlpineThrottler`](../interfaces/AlpineThrottler.md)\<`TFn`, `TSelected`\>
