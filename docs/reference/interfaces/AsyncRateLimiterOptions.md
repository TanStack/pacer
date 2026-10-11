---
id: AsyncRateLimiterOptions
title: AsyncRateLimiterOptions
---

Defined in: [async-rate-limiter.ts:72](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L72)

Options for configuring an async rate-limited function

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions?: AsyncRetryerOptions<TFn>;
```

Defined in: [async-rate-limiter.ts:76](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L76)

Options for configuring the underlying async retryer

***

### enabled?

```ts
optional enabled?: boolean | ((rateLimiter) => boolean);
```

Defined in: [async-rate-limiter.ts:82](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L82)

Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState?: Partial<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L86)

Initial state for the rate limiter

***

### key?

```ts
optional key?: string;
```

Defined in: [async-rate-limiter.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L91)

Optional key to identify this async rate limiter instance.
If provided, the async rate limiter will be identified by this key in the devtools and PacerProvider if applicable.

***

### limit

```ts
limit: number | ((rateLimiter) => number);
```

Defined in: [async-rate-limiter.ts:96](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L96)

Maximum number of executions allowed within the time window.
Can be a number or a function that returns a number.

***

### onError?

```ts
optional onError?: (error, args, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:102](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L102)

Optional error handler for when the rate-limited function throws.
If provided, the handler will be called with the error and rate limiter instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### args

`Parameters`\<`TFn`\>

##### rateLimiter

[`AsyncRateLimiter`](../classes/AsyncRateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onReject?

```ts
optional onReject?: (args, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:110](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L110)

Optional callback function that is called when an execution is rejected due to rate limiting

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### rateLimiter

[`AsyncRateLimiter`](../classes/AsyncRateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled?

```ts
optional onSettled?: (args, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:114](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L114)

Optional function to call when the rate-limited function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### rateLimiter

[`AsyncRateLimiter`](../classes/AsyncRateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, args, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:121](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L121)

Optional function to call when the rate-limited function is executed

#### Parameters

##### result

`Awaited`\<`ReturnType`\<`TFn`\>\>

##### args

`Parameters`\<`TFn`\>

##### rateLimiter

[`AsyncRateLimiter`](../classes/AsyncRateLimiter.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError?: boolean;
```

Defined in: [async-rate-limiter.ts:131](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L131)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### window

```ts
window: number | ((rateLimiter) => number);
```

Defined in: [async-rate-limiter.ts:136](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L136)

Time window in milliseconds within which the limit applies.
Can be a number or a function that returns a number.

***

### windowType?

```ts
optional windowType?: "fixed" | "sliding";
```

Defined in: [async-rate-limiter.ts:143](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L143)

Type of window to use for rate limiting
- 'fixed': Uses a fixed window that resets after the window period
- 'sliding': Uses a sliding window that allows executions as old ones expire
Defaults to 'fixed'
