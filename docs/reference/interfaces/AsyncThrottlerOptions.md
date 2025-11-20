---
id: AsyncThrottlerOptions
title: AsyncThrottlerOptions
---

# Interface: AsyncThrottlerOptions\<TFn\>

Defined in: [async-throttler.ts:76](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L76)

Options for configuring an async throttled function

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

## Properties

### asyncRetryerOptions?

```ts
optional asyncRetryerOptions: AsyncRetryerOptions<TFn>;
```

Defined in: [async-throttler.ts:80](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L80)

Options for configuring the underlying async retryer

***

### enabled?

```ts
optional enabled: boolean | (throttler) => boolean;
```

Defined in: [async-throttler.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L86)

Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
Can be a boolean or a function that returns a boolean.
Defaults to true.

***

### initialState?

```ts
optional initialState: Partial<AsyncThrottlerState<TFn>>;
```

Defined in: [async-throttler.ts:90](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L90)

Initial state for the async throttler

***

### key?

```ts
optional key: string;
```

Defined in: [async-throttler.ts:95](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L95)

Optional key to identify this async throttler instance.
If provided, the async throttler will be identified by this key in the devtools and PacerProvider if applicable.

***

### leading?

```ts
optional leading: boolean;
```

Defined in: [async-throttler.ts:100](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L100)

Whether to execute the function immediately when called
Defaults to true

***

### onError()?

```ts
optional onError: (error, args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:106](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L106)

Optional error handler for when the throttled function throws.
If provided, the handler will be called with the error and throttler instance.
This can be used alongside throwOnError - the handler will be called before any error is thrown.

#### Parameters

##### error

`Error`

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled()?

```ts
optional onSettled: (args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:114](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L114)

Optional function to call when the throttled function is executed

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, args, asyncThrottler) => void;
```

Defined in: [async-throttler.ts:121](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L121)

Optional function to call when the throttled function is executed

#### Parameters

##### result

`ReturnType`\<`TFn`\>

##### args

`Parameters`\<`TFn`\>

##### asyncThrottler

[`AsyncThrottler`](../../classes/AsyncThrottler.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError: boolean;
```

Defined in: [async-throttler.ts:131](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L131)

Whether to throw errors when they occur.
Defaults to true if no onError handler is provided, false if an onError handler is provided.
Can be explicitly set to override these defaults.

***

### trailing?

```ts
optional trailing: boolean;
```

Defined in: [async-throttler.ts:136](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L136)

Whether to execute the function on the trailing edge of the wait period
Defaults to true

***

### wait

```ts
wait: number | (throttler) => number;
```

Defined in: [async-throttler.ts:142](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L142)

Time window in milliseconds during which the function can only be executed once.
Can be a number or a function that returns a number.
Defaults to 0ms
