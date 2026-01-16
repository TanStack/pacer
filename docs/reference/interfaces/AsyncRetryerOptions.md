---
id: AsyncRetryerOptions
title: AsyncRetryerOptions
---

# Interface: AsyncRetryerOptions\<TFn\>

Defined in: [async-retryer.ts:60](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L60)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### backoff?

```ts
optional backoff: "linear" | "exponential" | "fixed";
```

Defined in: [async-retryer.ts:68](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L68)

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

Defined in: [async-retryer.ts:73](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L73)

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

Defined in: [async-retryer.ts:78](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L78)

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

Defined in: [async-retryer.ts:82](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L82)

Initial state to merge with the default state

***

### jitter?

```ts
optional jitter: number;
```

Defined in: [async-retryer.ts:87](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L87)

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

Defined in: [async-retryer.ts:92](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L92)

Optional key to identify this async retryer instance.
If provided, the async retryer will be identified by this key in the devtools and PacerProvider if applicable.

***

### maxAttempts?

```ts
optional maxAttempts: number | (retryer) => number;
```

Defined in: [async-retryer.ts:97](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L97)

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

Defined in: [async-retryer.ts:102](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L102)

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

Defined in: [async-retryer.ts:107](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L107)

Maximum total execution time in milliseconds for the entire retry operation before aborting

#### Default

```ts
Infinity
```

***

### onAbort()?

```ts
optional onAbort: (reason, retryer) => void;
```

Defined in: [async-retryer.ts:111](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L111)

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

Defined in: [async-retryer.ts:118](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L118)

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

Defined in: [async-retryer.ts:146](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L146)

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

Defined in: [async-retryer.ts:126](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L126)

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

Defined in: [async-retryer.ts:130](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L130)

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

Defined in: [async-retryer.ts:134](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L134)

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

Defined in: [async-retryer.ts:138](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L138)

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

Defined in: [async-retryer.ts:150](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L150)

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

Defined in: [async-retryer.ts:158](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/async-retryer.ts#L158)

Controls when errors are thrown:
- 'last': Only throw the final error after all retries are exhausted
- true: Throw every error immediately (disables retrying)
- false: Never throw errors, return undefined instead

#### Default

```ts
'last'
```
