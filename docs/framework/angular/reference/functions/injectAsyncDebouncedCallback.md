---
id: injectAsyncDebouncedCallback
title: injectAsyncDebouncedCallback
---

# Function: injectAsyncDebouncedCallback()

```ts
function injectAsyncDebouncedCallback<TFn>(fn, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [angular-pacer/src/async-debouncer/injectAsyncDebouncedCallback.ts:40](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncedCallback.ts#L40)

An Angular function that creates an async debounced version of a callback function.
This function is essentially a wrapper around `injectAsyncDebouncer` that provides
a simplified API for basic async debouncing needs.

The debounced function will only execute after the specified wait time has elapsed
since its last invocation. If called again before the wait time expires, the timer
resets and starts waiting again.

This function provides a simpler API compared to `injectAsyncDebouncer`, making it ideal for basic
async debouncing needs. However, it does not expose the underlying AsyncDebouncer instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution counts
- Error handling callbacks
- Retry support

Consider using the `injectAsyncDebouncer` function instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Parameters

### fn

`TFn`

### options

`AsyncDebouncerOptions`\<`TFn`\>

## Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

## Example

```ts
// Debounce an async search handler
const handleSearch = injectAsyncDebouncedCallback(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  { wait: 500 }
);

// Use in an input
const results = await handleSearch(searchQuery);
```
