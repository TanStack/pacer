---
id: AsyncRateLimiterOptions
title: AsyncRateLimiterOptions
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: AsyncRateLimiterOptions\<TFn\>

Defined in: [async-rate-limiter.ts:63](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L63)

Options for configuring an async rate-limited function

## Type Parameters

• **TFn** *extends* [`AnyAsyncFunction`](../../type-aliases/anyasyncfunction.md)

## Properties

### enabled?

```ts
optional enabled: boolean | (rateLimiter) => boolean;
```

Defined in: [async-rate-limiter.ts:69](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L69)

Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter.ts:73](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L73)

Initial state for the rate limiter

***

### limit

```ts
limit: number | (rateLimiter) => number;
```

Defined in: [async-rate-limiter.ts:78](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L78)

Maximum number of executions allowed within the time window.
Can be a number or a function that returns a number.

***

### onError()?

```ts
optional onError: (error, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:84](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L84)

Optional error handler for when the rate-limited function throws.
If provided, the handler will be called with the error and rate limiter instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`unknown`

##### rateLimiter

[`AsyncRateLimiter`](../../classes/asyncratelimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onReject()?

```ts
optional onReject: (rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:88](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L88)

Optional callback function that is called when an execution is rejected due to rate limiting

#### Parameters

##### rateLimiter

[`AsyncRateLimiter`](../../classes/asyncratelimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled()?

```ts
optional onSettled: (rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:92](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L92)

Optional function to call when the rate-limited function is executed

#### Parameters

##### rateLimiter

[`AsyncRateLimiter`](../../classes/asyncratelimiter.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, rateLimiter) => void;
```

Defined in: [async-rate-limiter.ts:96](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L96)

Optional function to call when the rate-limited function is executed

#### Parameters

##### result

`ReturnType`\<`TFn`\>

##### rateLimiter

[`AsyncRateLimiter`](../../classes/asyncratelimiter.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError: boolean;
```

Defined in: [async-rate-limiter.ts:105](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L105)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### window

```ts
window: number | (rateLimiter) => number;
```

Defined in: [async-rate-limiter.ts:110](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L110)

Time window in milliseconds within which the limit applies.
Can be a number or a function that returns a number.

***

### windowType?

```ts
optional windowType: "fixed" | "sliding";
```

Defined in: [async-rate-limiter.ts:117](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L117)

Type of window to use for rate limiting
- 'fixed': Uses a fixed window that resets after the window period
- 'sliding': Uses a sliding window that allows executions as old ones expire
Defaults to 'fixed'
