---
id: RateLimiter
title: RateLimiter
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Class: RateLimiter\<TFn, TArgs\>

Defined in: [rate-limiter.ts:77](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L77)

A class that creates a rate-limited function.

Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
all executions happen immediately, followed by a complete block.

For smoother execution patterns, consider using:
- Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
- Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)

Rate limiting is best used for hard API limits or resource constraints. For UI updates or
smoothing out frequent events, throttling or debouncing usually provide better user experience.

## Example

```ts
const rateLimiter = new RateLimiter(
  (id: string) => api.getData(id),
  { limit: 5, window: 1000 } // 5 calls per second
);

// Will execute immediately until limit reached, then block
rateLimiter.maybeExecute('123');
```

## Type Parameters

• **TFn** *extends* (...`args`) => `any`

• **TArgs** *extends* `Parameters`\<`TFn`\>

## Constructors

### new RateLimiter()

```ts
new RateLimiter<TFn, TArgs>(fn, initialOptions): RateLimiter<TFn, TArgs>
```

Defined in: [rate-limiter.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L86)

#### Parameters

##### fn

`TFn`

##### initialOptions

[`RateLimiterOptions`](../interfaces/ratelimiteroptions.md)

#### Returns

[`RateLimiter`](ratelimiter.md)\<`TFn`, `TArgs`\>

## Methods

### getExecutionCount()

```ts
getExecutionCount(): number
```

Defined in: [rate-limiter.ts:111](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L111)

Returns the number of times the function has been executed

#### Returns

`number`

***

### getRejectionCount()

```ts
getRejectionCount(): number
```

Defined in: [rate-limiter.ts:118](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L118)

Returns the number of times the function has been rejected

#### Returns

`number`

***

### getRemainingInWindow()

```ts
getRemainingInWindow(): number
```

Defined in: [rate-limiter.ts:125](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L125)

Returns the number of remaining executions allowed in the current window

#### Returns

`number`

***

### maybeExecute()

```ts
maybeExecute(...args): boolean
```

Defined in: [rate-limiter.ts:145](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L145)

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

#### Parameters

##### args

...`TArgs`

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

Defined in: [rate-limiter.ts:193](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L193)

Resets the rate limiter state

#### Returns

`void`

***

### setOptions()

```ts
setOptions(newOptions): RateLimiterOptions
```

Defined in: [rate-limiter.ts:100](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L100)

Updates the rate limiter options
Returns the new options state

#### Parameters

##### newOptions

`Partial`\<[`RateLimiterOptions`](../interfaces/ratelimiteroptions.md)\>

#### Returns

[`RateLimiterOptions`](../interfaces/ratelimiteroptions.md)
