---
id: createAsyncDebouncedCallback
title: createAsyncDebouncedCallback
---

```ts
function createAsyncDebouncedCallback<TFn>(
   host,
   fn,
options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [async-debouncer/createAsyncDebouncedCallback.ts:13](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-debouncer/createAsyncDebouncedCallback.ts#L13)

Returns a stable debounced callback with the same options and cleanup as createAsyncDebouncer.
Use the constructor instead when you also need selected state or control methods.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### host

`ReactiveControllerHost`

### fn

`TFn`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`LitAsyncDebouncerOptions`](../interfaces/LitAsyncDebouncerOptions.md)\<`TFn`, \{
\}\>\>

## Returns

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

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

### Throws

The error from the debounced function if no onError handler is configured
