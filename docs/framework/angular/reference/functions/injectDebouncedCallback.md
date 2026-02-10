---
id: injectDebouncedCallback
title: injectDebouncedCallback
---

# Function: injectDebouncedCallback()

```ts
function injectDebouncedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [debouncer/injectDebouncedCallback.ts:40](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedCallback.ts#L40)

An Angular function that creates a debounced version of a callback function.
This function is essentially a wrapper around `injectDebouncer` that provides
a simplified API for basic debouncing needs.

The debounced function will only execute after the specified wait time has elapsed
since its last invocation. If called again before the wait time expires, the timer
resets and starts waiting again.

This function provides a simpler API compared to `injectDebouncer`, making it ideal for basic
debouncing needs. However, it does not expose the underlying Debouncer instance.

For advanced usage requiring features like:
- Manual cancellation
- Access to execution counts
- State tracking

Consider using the `injectDebouncer` function instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

`TFn`

### options

`DebouncerOptions`\<`TFn`\>

## Returns

```ts
(...args): void;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

## Example

```ts
// Debounce a search handler
const handleSearch = injectDebouncedCallback((query: string) => {
  fetchSearchResults(query);
}, {
  wait: 500 // Wait 500ms between executions
});

// Use in an input
<input
  type="search"
  (input)="handleSearch($event.target.value)"
/>
```
