---
id: AsyncThrottlerState
title: AsyncThrottlerState
---

Defined in: [async-throttler.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L9)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### errorCount

```ts
errorCount: number;
```

Defined in: [async-throttler.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L13)

Number of function executions that have resulted in errors

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-throttler.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L17)

Whether the throttled function is currently executing asynchronously

***

### isPending

```ts
isPending: boolean;
```

Defined in: [async-throttler.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L21)

Whether the throttler is waiting for the timeout to trigger execution

***

### lastArgs

```ts
lastArgs: Parameters<TFn> | undefined;
```

Defined in: [async-throttler.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L25)

The arguments from the most recent call to maybeExecute

***

### lastExecutionTime

```ts
lastExecutionTime: number;
```

Defined in: [async-throttler.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L29)

Timestamp of the last function execution in milliseconds

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-throttler.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L33)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-throttler.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L37)

Number of times maybeExecute has been called (for reduction calculations)

***

### nextExecutionTime

```ts
nextExecutionTime: number | undefined;
```

Defined in: [async-throttler.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L41)

Timestamp when the next execution can occur in milliseconds

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-throttler.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L45)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "executing" | "pending" | "settled";
```

Defined in: [async-throttler.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L49)

Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed

***

### successCount

```ts
successCount: number;
```

Defined in: [async-throttler.ts:53](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L53)

Number of function executions that have completed successfully
