---
id: Throttler
title: Throttler
---

# Class: Throttler\<TFn\>

Defined in: [throttler.ts:156](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L156)

A class that creates a throttled function.

Throttling ensures a function is called at most once within a specified time window.
Unlike debouncing which waits for a pause in calls, throttling guarantees consistent
execution timing regardless of call frequency.
This synchronous version is lighter weight and often all you need - upgrade to AsyncThrottler when you need promises, retry support, abort/cancel capabilities, or advanced error handling.

Supports both leading and trailing edge execution:
- Leading: Execute immediately on first call (default: true)
- Trailing: Execute after wait period if called during throttle (default: true)

For collapsing rapid-fire events where you only care about the last call, consider using Debouncer.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the throttler
- Use `onExecute` callback to react to function execution and implement custom logic
- The state includes execution count, last execution time, pending status, and more
- State can be accessed via `throttler.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `throttler.state`

## Example

```ts
const throttler = new Throttler(
  (id: string) => api.getData(id),
  { wait: 1000 } // Execute at most once per second
);

// First call executes immediately
throttler.maybeExecute('123');

// Subsequent calls within 1000ms are throttled
throttler.maybeExecute('123'); // Throttled
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Constructors

### Constructor

```ts
new Throttler<TFn>(fn, initialOptions): Throttler<TFn>;
```

Defined in: [throttler.ts:164](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L164)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`ThrottlerOptions`](../interfaces/ThrottlerOptions.md)\<`TFn`\>

#### Returns

`Throttler`\<`TFn`\>

## Properties

### fn

```ts
fn: TFn;
```

Defined in: [throttler.ts:165](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L165)

***

### key

```ts
key: string | undefined;
```

Defined in: [throttler.ts:160](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L160)

***

### options

```ts
options: ThrottlerOptions<TFn>;
```

Defined in: [throttler.ts:161](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L161)

***

### store

```ts
readonly store: Store<Readonly<ThrottlerState<TFn>>>;
```

Defined in: [throttler.ts:157](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L157)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [throttler.ts:326](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L326)

Cancels any pending trailing execution and clears internal state.

If a trailing execution is scheduled (due to throttling with trailing=true),
this will prevent that execution from occurring. The internal timeout and
stored arguments will be cleared.

Has no effect if there is no pending execution.

#### Returns

`void`

***

### flush()

```ts
flush(): void;
```

Defined in: [throttler.ts:304](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L304)

Processes the current pending execution immediately

#### Returns

`void`

***

### maybeExecute()

```ts
maybeExecute(...args): void;
```

Defined in: [throttler.ts:245](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L245)

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

`void`

#### Example

```ts
const throttled = new Throttler(fn, { wait: 1000 });

// First call executes immediately
throttled.maybeExecute('a', 'b');

// Call during wait period - gets throttled
throttled.maybeExecute('c', 'd');
```

***

### reset()

```ts
reset(): void;
```

Defined in: [throttler.ts:337](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L337)

Resets the throttler state to its default values

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [throttler.ts:187](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/throttler.ts#L187)

Updates the throttler options

#### Parameters

##### newOptions

`Partial`\<[`ThrottlerOptions`](../interfaces/ThrottlerOptions.md)\<`TFn`\>\>

#### Returns

`void`
