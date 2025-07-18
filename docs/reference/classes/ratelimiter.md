---
id: RateLimiter
title: RateLimiter
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Class: RateLimiter\<TFn\>

Defined in: [rate-limiter.ts:132](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L132)

A class that creates a rate-limited function.

Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
all executions happen immediately, followed by a complete block.

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

• **TFn** *extends* [`AnyFunction`](../../type-aliases/anyfunction.md)

## Constructors

### new RateLimiter()

```ts
new RateLimiter<TFn>(fn, initialOptions): RateLimiter<TFn>
```

Defined in: [rate-limiter.ts:138](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L138)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`RateLimiterOptions`](../../interfaces/ratelimiteroptions.md)\<`TFn`\>

#### Returns

[`RateLimiter`](../ratelimiter.md)\<`TFn`\>

## Properties

### options

```ts
options: RateLimiterOptions<TFn>;
```

Defined in: [rate-limiter.ts:135](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L135)

***

### store

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter.ts:133](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L133)

## Methods

### getMsUntilNextWindow()

```ts
getMsUntilNextWindow(): number
```

Defined in: [rate-limiter.ts:317](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L317)

Returns the number of milliseconds until the next execution will be possible

#### Returns

`number`

***

### getRemainingInWindow()

```ts
getRemainingInWindow(): number
```

Defined in: [rate-limiter.ts:309](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L309)

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

***

### maybeExecute()

```ts
maybeExecute(...args): boolean
```

Defined in: [rate-limiter.ts:215](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L215)

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
reset(): void
```

Defined in: [rate-limiter.ts:328](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L328)

Resets the rate limiter state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void
```

Defined in: [rate-limiter.ts:155](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L155)

Updates the rate limiter options

#### Parameters

##### newOptions

`Partial`\<[`RateLimiterOptions`](../../interfaces/ratelimiteroptions.md)\<`TFn`\>\>

#### Returns

`void`
