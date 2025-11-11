---
id: throttle
title: throttle
---

# Function: throttle()

```ts
function throttle<TFn>(fn, initialOptions): (...args) => void;
```

Defined in: [throttler.ts:375](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L375)

Creates a throttled function that limits how often the provided function can execute.

This synchronous version is lighter weight and often all you need - upgrade to asyncThrottle when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

Throttling ensures a function executes at most once within a specified time window,
regardless of how many times it is called. This is useful for rate-limiting
expensive operations or UI updates.

The throttled function can be configured to execute on the leading and/or trailing
edge of the throttle window via options.

For handling bursts of events, consider using debounce() instead. For hard execution
limits, consider using rateLimit().

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the throttler
- Use `onExecute` callback to react to function execution and implement custom logic
- The state includes execution count, last execution time, pending status, and more
- State can be accessed via the underlying Throttler instance's `store.state` property
- When using framework adapters (React/Solid), state is accessed from the hook's state property

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../../type-aliases/AnyFunction.md)

## Parameters

### fn

`TFn`

### initialOptions

[`ThrottlerOptions`](../../interfaces/ThrottlerOptions.md)\<`TFn`\>

## Returns

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

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

## Example

```ts
// Basic throttling - max once per second
const throttled = throttle(updateUI, { wait: 1000 });

// Configure leading/trailing execution
const throttled = throttle(saveData, {
  wait: 2000,
  leading: true,  // Execute immediately on first call
  trailing: true  // Execute again after delay if called during wait
});
```
