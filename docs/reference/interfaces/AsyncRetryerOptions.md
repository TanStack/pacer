---
id: AsyncRetryerOptions
title: AsyncRetryerOptions
---

Defined in: [async-retryer.ts:61](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L61)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### backoff?

```ts
optional backoff?: "linear" | "exponential" | "fixed";
```

Defined in: [async-retryer.ts:69](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L69)

The backoff strategy for retry delays:
- 'exponential': Wait time doubles with each attempt (1s, 2s, 4s, ...)
- 'linear': Wait time increases linearly (1s, 2s, 3s, ...)
- 'fixed': Same wait time for all attempts

#### Default

```ts
'exponential'
```

***

### baseWait?

```ts
optional baseWait?: number | ((retryer) => number);
```

Defined in: [async-retryer.ts:74](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L74)

Base wait time in milliseconds between retries, or a function that returns the wait time

#### Default

```ts
1000
```

***

### enabled?

```ts
optional enabled?: boolean | ((retryer) => boolean);
```

Defined in: [async-retryer.ts:79](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L79)

Whether the retryer is enabled, or a function that determines if it's enabled

#### Default

```ts
true
```

***

### initialState?

```ts
optional initialState?: Partial<AsyncRetryerState<TFn>>;
```

Defined in: [async-retryer.ts:83](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L83)

Initial state to merge with the default state

***

### jitter?

```ts
optional jitter?: number;
```

Defined in: [async-retryer.ts:88](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L88)

Jitter percentage to add to retry delays (0-1). Adds randomness to prevent thundering herd.

#### Default

```ts
0
```

***

### key?

```ts
optional key?: string;
```

Defined in: [async-retryer.ts:96](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L96)

Optional key to identify this async retryer instance.
Note: async retryers are not currently surfaced in the devtools, so this key
is only a plain identifier. Retryer instances are often created per-execution
(including internally by the other async utilities), so they intentionally do
not register with the devtools event bus.

***

### maxAttempts?

```ts
optional maxAttempts?: number | ((retryer) => number);
```

Defined in: [async-retryer.ts:101](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L101)

Maximum number of retry attempts, or a function that returns the max attempts

#### Default

```ts
3
```

***

### maxExecutionTime?

```ts
optional maxExecutionTime?: number;
```

Defined in: [async-retryer.ts:106](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L106)

Maximum execution time in milliseconds for a single function call before aborting

#### Default

```ts
Infinity
```

***

### maxTotalExecutionTime?

```ts
optional maxTotalExecutionTime?: number;
```

Defined in: [async-retryer.ts:111](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L111)

Maximum total execution time in milliseconds for the entire retry operation before aborting

#### Default

```ts
Infinity
```

***

### maxWait?

```ts
optional maxWait?: number | ((retryer) => number);
```

Defined in: [async-retryer.ts:116](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L116)

Maximum wait time in milliseconds to cap retry delays, or a function that returns the max wait time

#### Default

```ts
Infinity
```

***

### onAbort?

```ts
optional onAbort?: (reason, retryer) => void;
```

Defined in: [async-retryer.ts:120](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L120)

Callback invoked when the execution is aborted (manually or due to timeouts)

#### Parameters

##### reason

`"manual"` \| `"execution-timeout"` \| `"total-timeout"` \| `"new-execution"`

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onError?

```ts
optional onError?: (error, args, retryer) => void;
```

Defined in: [async-retryer.ts:127](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L127)

Callback invoked when any error occurs during execution (including retries)

#### Parameters

##### error

`Error`

##### args

`Parameters`\<`TFn`\>

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onExecutionTimeout?

```ts
optional onExecutionTimeout?: (retryer) => void;
```

Defined in: [async-retryer.ts:135](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L135)

Callback invoked when a single execution attempt times out (maxExecutionTime exceeded)

#### Parameters

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onLastError?

```ts
optional onLastError?: (error, retryer) => void;
```

Defined in: [async-retryer.ts:139](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L139)

Callback invoked when the final error occurs after all retries are exhausted

#### Parameters

##### error

`Error`

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onRetry?

```ts
optional onRetry?: (attempt, error, retryer) => void;
```

Defined in: [async-retryer.ts:143](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L143)

Callback invoked before each retry attempt

#### Parameters

##### attempt

`number`

##### error

`Error`

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onSettled?

```ts
optional onSettled?: (args, retryer) => void;
```

Defined in: [async-retryer.ts:147](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L147)

Callback invoked after execution completes (success or failure) of each attempt

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess?

```ts
optional onSuccess?: (result, args, retryer) => void;
```

Defined in: [async-retryer.ts:151](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L151)

Callback invoked when execution succeeds

#### Parameters

##### result

`Awaited`\<`ReturnType`\<`TFn`\>\>

##### args

`Parameters`\<`TFn`\>

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onTotalExecutionTimeout?

```ts
optional onTotalExecutionTimeout?: (retryer) => void;
```

Defined in: [async-retryer.ts:159](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L159)

Callback invoked when the total execution time times out (maxTotalExecutionTime exceeded)

#### Parameters

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError?: boolean | "last";
```

Defined in: [async-retryer.ts:167](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L167)

Controls when errors are thrown:
- 'last': Only throw the final error after all retries are exhausted
- true: Throw every error immediately (disables retrying)
- false: Never throw errors, return undefined instead

#### Default

```ts
'last'
```
