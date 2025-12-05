---
id: AsyncRetryerState
title: AsyncRetryerState
---

# Interface: AsyncRetryerState\<TFn\>

Defined in: [async-retryer.ts:6](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L6)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### currentAttempt

```ts
currentAttempt: number;
```

Defined in: [async-retryer.ts:10](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L10)

The current retry attempt number (0 when not executing)

***

### executionCount

```ts
executionCount: number;
```

Defined in: [async-retryer.ts:14](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L14)

Total number of completed executions (successful or failed)

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-retryer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L18)

Whether the retryer is currently executing the function

***

### lastError

```ts
lastError: Error | undefined;
```

Defined in: [async-retryer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L22)

The most recent error encountered during execution

***

### lastExecutionTime

```ts
lastExecutionTime: number;
```

Defined in: [async-retryer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L26)

Timestamp of the last execution completion in milliseconds

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-retryer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L30)

The result from the most recent successful execution

***

### status

```ts
status: "disabled" | "idle" | "executing" | "retrying";
```

Defined in: [async-retryer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L34)

Current execution status - 'disabled' when not enabled, 'idle' when ready, 'executing' when running

***

### totalExecutionTime

```ts
totalExecutionTime: number;
```

Defined in: [async-retryer.ts:38](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L38)

Total time spent executing (including retries) in milliseconds
