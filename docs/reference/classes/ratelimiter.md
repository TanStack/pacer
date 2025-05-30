---
id: RateLimiter
title: RateLimiter
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Class: RateLimiter\<TFn\>

Defined in: [rate-limiter.ts:80](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L80)

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

## Example

```ts
const rateLimiter = new RateLimiter(
  (id: string) => api.getData(id),
  { limit: 5, window: 1000, windowType: 'sliding' } // 5 calls per second with sliding window
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

Defined in: [rate-limiter.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L86)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`RateLimiterOptions`](../../interfaces/ratelimiteroptions.md)\<`TFn`\>

#### Returns

[`RateLimiter`](../ratelimiter.md)\<`TFn`\>

## Methods

### getEnabled()

```ts
getEnabled(): boolean
```

Defined in: [rate-limiter.ts:113](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L113)

Returns the current enabled state of the rate limiter

#### Returns

`boolean`

***

### getExecutionCount()

```ts
getExecutionCount(): number
```

Defined in: [rate-limiter.ts:198](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L198)

Returns the number of times the function has been executed

#### Returns

`number`

***

### getLimit()

```ts
getLimit(): number
```

Defined in: [rate-limiter.ts:120](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L120)

Returns the current limit of executions allowed within the time window

#### Returns

`number`

***

### getMsUntilNextWindow()

```ts
getMsUntilNextWindow(): number
```

Defined in: [rate-limiter.ts:220](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L220)

Returns the number of milliseconds until the next execution will be possible

#### Returns

`number`

***

### getOptions()

```ts
getOptions(): Required<RateLimiterOptions<TFn>>
```

Defined in: [rate-limiter.ts:106](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L106)

Returns the current rate limiter options

#### Returns

`Required`\<[`RateLimiterOptions`](../../interfaces/ratelimiteroptions.md)\<`TFn`\>\>

***

### getRejectionCount()

```ts
getRejectionCount(): number
```

Defined in: [rate-limiter.ts:205](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L205)

Returns the number of times the function has been rejected

#### Returns

`number`

***

### getRemainingInWindow()

```ts
getRemainingInWindow(): number
```

Defined in: [rate-limiter.ts:212](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L212)

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

***

### getWindow()

```ts
getWindow(): number
```

Defined in: [rate-limiter.ts:127](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L127)

Returns the current time window in milliseconds

#### Returns

`number`

***

### maybeExecute()

```ts
maybeExecute(...args): boolean
```

Defined in: [rate-limiter.ts:146](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L146)

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

Defined in: [rate-limiter.ts:231](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L231)

Resets the rate limiter state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): void
```

Defined in: [rate-limiter.ts:99](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L99)

Updates the rate limiter options

#### Parameters

##### newOptions

`Partial`\<[`RateLimiterOptions`](../../interfaces/ratelimiteroptions.md)\<`TFn`\>\>

#### Returns

`void`
