---
id: AsyncThrottlerOptions
title: AsyncThrottlerOptions
---

Defined in: [async-throttler.ts:77](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L77)

Options for configuring an async throttled function

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions?: AsyncRetryerOptions<TFn>;
```

Defined in: [async-throttler.ts:81](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L81)

Options for configuring the underlying async retryer

***

### enabled?

```ts
optional enabled?: boolean | ((throttler) => boolean);
```

Defined in: [async-throttler.ts:87](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L87)

Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState?: Partial<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler.ts:91](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L91)

Initial state for the async throttler

***

### key?

```ts
optional key?: string;
```

Defined in: [async-throttler.ts:96](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L96)

Optional key to identify this async throttler instance.
If provided, the async throttler will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading?: boolean;
```

Defined in: [async-throttler.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L101)

Whether to execute the function immediately when called
Defaults to true

***

### onError?

```ts
optional onError?: (error, args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:107](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L107)

Optional error handler for when the throttled function throws.
If provided, the handler will be called with the error and throttler instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled?

```ts
optional onSettled?: (args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:115](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L115)

Optional function to call when the throttled function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:122](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L122)

Optional function to call when the throttled function is executed

#### Parameters

##### result

`Awaited`\<`ReturnType`\<`TFn`\>\>

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError?: boolean;
```

Defined in: [async-throttler.ts:132](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L132)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### trailing?

```ts
optional trailing?: boolean;
```

Defined in: [async-throttler.ts:137](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L137)

Whether to execute the function on the trailing edge of the wait period
Defaults to true

***

### wait

```ts
wait: number | ((throttler) => number);
```

Defined in: [async-throttler.ts:143](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L143)

Time window in milliseconds during which the function can only be executed once.
Can be a number or a function that returns a number.
Defaults to 0ms
