---
id: AsyncRetryerOptions
title: AsyncRetryerOptions
---

# Interface: AsyncRetryerOptions\<TFn\>

Defined in: [async-retryer.ts:59](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L59)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### backoff?

```ts
optional backoff: "linear" | "exponential" | "fixed";
```

Defined in: [async-retryer.ts:67](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L67)

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
optional baseWait: number | (retryer) => number;
```

Defined in: [async-retryer.ts:72](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L72)

Base wait time in milliseconds between retries, or a function that returns the wait time

#### Default

```ts
1000
```

***

### enabled?

```ts
optional enabled: boolean | (retryer) => boolean;
```

Defined in: [async-retryer.ts:77](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L77)

Whether the retryer is enabled, or a function that determines if it's enabled

#### Default

```ts
true
```

***

### initialState?

```ts
optional initialState: Partial<AsyncRetryerState<TFn>>;
```

Defined in: [async-retryer.ts:81](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L81)

Initial state to merge with the default state

***

### jitter?

```ts
optional jitter: number;
```

Defined in: [async-retryer.ts:86](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L86)

Jitter percentage to add to retry delays (0-1). Adds randomness to prevent thundering herd.

#### Default

```ts
0
```

***

### key?

```ts
optional key: string;
```

Defined in: [async-retryer.ts:94](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L94)

Optional key to identify this async retryer instance.
Note: async retryers are not currently surfaced in the devtools, so this key
is only a plain identifier. Retryer instances are often created per-execution
(including internally by the other async utilities), so they intentionally do
not register with the devtools event bus.

***

### maxAttempts?

```ts
optional maxAttempts: number | (retryer) => number;
```

Defined in: [async-retryer.ts:99](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L99)

Maximum number of retry attempts, or a function that returns the max attempts

#### Default

```ts
3
```

***

### maxExecutionTime?

```ts
optional maxExecutionTime: number;
```

Defined in: [async-retryer.ts:104](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L104)

Maximum execution time in milliseconds for a single function call before aborting

#### Default

```ts
Infinity
```

***

### maxTotalExecutionTime?

```ts
optional maxTotalExecutionTime: number;
```

Defined in: [async-retryer.ts:109](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L109)

Maximum total execution time in milliseconds for the entire retry operation before aborting

#### Default

```ts
Infinity
```

***

### maxWait?

```ts
optional maxWait: number | (retryer) => number;
```

Defined in: [async-retryer.ts:114](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L114)

Maximum wait time in milliseconds to cap retry delays, or a function that returns the max wait time

#### Default

```ts
Infinity
```

***

### onAbort()?

```ts
optional onAbort: (reason, retryer) => void;
```

Defined in: [async-retryer.ts:118](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L118)

Callback invoked when the execution is aborted (manually or due to timeouts)

#### Parameters

##### reason

`"manual"` | `"execution-timeout"` | `"total-timeout"` | `"new-execution"`

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onError()?

```ts
optional onError: (error, args, retryer) => void;
```

Defined in: [async-retryer.ts:125](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L125)

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

### onExecutionTimeout()?

```ts
optional onExecutionTimeout: (retryer) => void;
```

Defined in: [async-retryer.ts:133](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L133)

Callback invoked when a single execution attempt times out (maxExecutionTime exceeded)

#### Parameters

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onLastError()?

```ts
optional onLastError: (error, retryer) => void;
```

Defined in: [async-retryer.ts:137](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L137)

Callback invoked when the final error occurs after all retries are exhausted

#### Parameters

##### error

`Error`

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onRetry()?

```ts
optional onRetry: (attempt, error, retryer) => void;
```

Defined in: [async-retryer.ts:141](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L141)

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

### onSettled()?

```ts
optional onSettled: (args, retryer) => void;
```

Defined in: [async-retryer.ts:145](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L145)

Callback invoked after execution completes (success or failure) of each attempt

#### Parameters

##### args

`Parameters`\<`TFn`\>

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### onSuccess()?

```ts
optional onSuccess: (result, args, retryer) => void;
```

Defined in: [async-retryer.ts:149](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L149)

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

### onTotalExecutionTimeout()?

```ts
optional onTotalExecutionTimeout: (retryer) => void;
```

Defined in: [async-retryer.ts:157](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L157)

Callback invoked when the total execution time times out (maxTotalExecutionTime exceeded)

#### Parameters

##### retryer

[`AsyncRetryer`](../classes/AsyncRetryer.md)\<`TFn`\>

#### Returns

`void`

***

### throwOnError?

```ts
optional throwOnError: boolean | "last";
```

Defined in: [async-retryer.ts:165](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L165)

Controls when errors are thrown:
- 'last': Only throw the final error after all retries are exhausted
- true: Throw every error immediately (disables retrying)
- false: Never throw errors, return undefined instead

#### Default

```ts
'last'
```
