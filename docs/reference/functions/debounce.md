---
id: debounce
title: debounce
---

# Function: debounce()

```ts
function debounce<TFn>(fn, initialOptions): (...args) => void;
```

Defined in: [debouncer.ts:326](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/debouncer.ts#L326)

Creates a debounced function that delays invoking the provided function until after a specified wait time.
Multiple calls during the wait period will cancel previous pending invocations and reset the timer.

This synchronous version is lighter weight and often all you need - upgrade to asyncDebounce when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

If leading option is true, the function will execute immediately on the first call, then wait the delay
before allowing another execution.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the debouncer
- Use `onExecute` callback to react to function execution and implement custom logic
- The state includes canLeadingExecute, execution count, and isPending status
- State can be accessed via the underlying Debouncer instance's `store.state` property
- When using framework adapters (React/Solid), state is accessed from the hook's state property

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../../type-aliases/AnyFunction.md)

## Parameters

### fn

`TFn`

### initialOptions

[`DebouncerOptions`](../../interfaces/DebouncerOptions.md)\<`TFn`\>

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
const debounced = debounce(() => {
  saveChanges();
}, { wait: 1000 });

// Called repeatedly but executes at most once per second
inputElement.addEventListener('input', debounced);
```
