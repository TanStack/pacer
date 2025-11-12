---
id: RateLimiter
title: RateLimiter
---

# Class: RateLimiter\<TFn\>

Defined in: [rate-limiter.ts:156](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L156)

A class that creates a rate-limited function.

Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
all executions happen immediately, followed by a complete block.
This synchronous version is lighter weight and often all you need - upgrade to AsyncRateLimiter when you need promises, retry support, abort capabilities, or advanced error handling.

The rate limiter supports two types of windows:
- 'fixed': A strict window that resets after the window period. All executions within the window count
  towards the limit, and the window resets completely after the period.
- 'sliding': A rolling window that allows executions as old ones expire. This provides a more
  consistent rate of execution over time.

For smoother execution patterns, consider using:
- Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
- Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)

Rate limiting is best used for hard API limits or resource constraints. For UI updates or
smoothing out frequent events, throttling or debouncing usually provide better user experience.

State Management:
- Uses TanStack Store for reactive state management
- Use `initialState` to provide initial state values when creating the rate limiter
- Use `onExecute` callback to react to function execution and implement custom logic
- Use `onReject` callback to react to executions being rejected when rate limit is exceeded
- The state includes execution count, execution times, and rejection count
- State can be accessed via `rateLimiter.store.state` when using the class directly
- When using framework adapters (React/Solid), state is accessed from `rateLimiter.state`

## Example

```ts
const rateLimiter = new RateLimiter(
  (id: string) => api.getData(id),
  {
    limit: 5,
    window: 1000,
    windowType: 'sliding',
  }
);

// Will execute immediately until limit reached, then block
rateLimiter.maybeExecute('123');
```

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../../type-aliases/AnyFunction.md)

## Constructors

### Constructor

```ts
new RateLimiter<TFn>(fn, initialOptions): RateLimiter<TFn>;
```

Defined in: [rate-limiter.ts:163](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L163)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`RateLimiterOptions`](../../interfaces/RateLimiterOptions.md)\<`TFn`\>

#### Returns

`RateLimiter`\<`TFn`\>

## Properties

### fn

```ts
fn: TFn;
```

Defined in: [rate-limiter.ts:164](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L164)

***

### key

```ts
key: string | undefined;
```

Defined in: [rate-limiter.ts:159](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L159)

***

### options

```ts
options: RateLimiterOptions<TFn>;
```

Defined in: [rate-limiter.ts:160](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L160)

***

### store

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter.ts:157](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L157)

## Methods

### getMsUntilNextWindow()

```ts
getMsUntilNextWindow(): number;
```

Defined in: [rate-limiter.ts:354](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L354)

Returns the number of milliseconds until the next execution will be possible

#### Returns

`number`

***

### getRemainingInWindow()

```ts
getRemainingInWindow(): number;
```

Defined in: [rate-limiter.ts:346](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L346)

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

***

### maybeExecute()

```ts
maybeExecute(...args): boolean;
```

Defined in: [rate-limiter.ts:248](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L248)

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

#### Parameters

##### args

...`Parameters`\<`TFn`\>

#### Returns

`boolean`

#### Example

```ts
const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return true
rateLimiter.maybeExecute('arg1', 'arg2'); // true

// Additional calls within the window will return false
rateLimiter.maybeExecute('arg1', 'arg2'); // false
```

***

### reset()

```ts
reset(): void;
```

Defined in: [rate-limiter.ts:365](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L365)

Resets the rate limiter state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void;
```

Defined in: [rate-limiter.ts:187](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L187)

Updates the rate limiter options

#### Parameters

##### newOptions

`Partial`\<[`RateLimiterOptions`](../../interfaces/RateLimiterOptions.md)\<`TFn`\>\>

#### Returns

`void`
