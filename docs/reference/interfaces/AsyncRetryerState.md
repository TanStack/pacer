---
id: AsyncRetryerState
title: AsyncRetryerState
---

Defined in: [async-retryer.ts:7](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L7)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### currentAttempt

```ts
currentAttempt: number;
```

Defined in: [async-retryer.ts:11](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L11)

The current retry attempt number (0 when not executing)

***

### executionCount

```ts
executionCount: number;
```

Defined in: [async-retryer.ts:15](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L15)

Total number of completed executions (successful or failed)

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-retryer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L19)

Whether the retryer is currently executing the function

***

### lastError

```ts
lastError: Error | undefined;
```

Defined in: [async-retryer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L23)

The most recent error encountered during execution

***

### lastExecutionTime

```ts
lastExecutionTime: number;
```

Defined in: [async-retryer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L27)

Timestamp of the last execution completion in milliseconds

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-retryer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L31)

The result from the most recent successful execution

***

### status

```ts
status: "disabled" | "idle" | "executing" | "retrying";
```

Defined in: [async-retryer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L35)

Current execution status - 'disabled' when not enabled, 'idle' when ready, 'executing' when running

***

### totalExecutionTime

```ts
totalExecutionTime: number;
```

Defined in: [async-retryer.ts:39](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-retryer.ts#L39)

Total time spent executing (including retries) in milliseconds
