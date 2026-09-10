---
id: RateLimiterOptions
title: RateLimiterOptions
---

# Interface: RateLimiterOptions\<TFn\>

Defined in: [rate-limiter.ts:47](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L47)

Options for configuring a rate-limited function

## Type Parameters

### TFn

`TFn` *extends* [`AnyFunction`](../type-aliases/AnyFunction.md)

## Properties

### enabled?

```ts
optional enabled: boolean | (rateLimiter) => boolean;
```

Defined in: [rate-limiter.ts:52](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L52)

Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<RateLimiterState>;
```

Defined in: [rate-limiter.ts:56](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L56)

Initial state for the rate limiter

***

### key?

```ts
optional key: string;
```

Defined in: [rate-limiter.ts:61](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L61)

Optional key to identify this rate limiter instance.
If provided, the rate limiter will be identified by this key in the devtools and PacerProvider if applicable.

***

### limit

```ts
limit: number | (rateLimiter) => number;
```

Defined in: [rate-limiter.ts:66](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L66)

Maximum number of executions allowed within the time window.
Can be a number or a callback function that receives the rate limiter instance and returns a number.

***

### onExecute()?

```ts
optional onExecute: (args, rateLimiter) => void;
```

Defined in: [rate-limiter.ts:70](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L70)

Callback function that is called after the function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### rateLimiter

[`RateLimiter`](../classes/RateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onReject()?

```ts
optional onReject: (rateLimiter) => void;
```

Defined in: [rate-limiter.ts:74](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L74)

Optional callback function that is called when an execution is rejected due to rate limiting

#### Parameters

##### rateLimiter

[`RateLimiter`](../classes/RateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### window

```ts
window: number | (rateLimiter) => number;
```

Defined in: [rate-limiter.ts:79](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L79)

Time window in milliseconds within which the limit applies.
Can be a number or a callback function that receives the rate limiter instance and returns a number.

***

### windowType?

```ts
optional windowType: "fixed" | "sliding";
```

Defined in: [rate-limiter.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L86)

Type of window to use for rate limiting
- 'fixed': Uses a fixed window that resets after the window period
- 'sliding': Uses a sliding window that allows executions as old ones expire
Defaults to 'fixed'
