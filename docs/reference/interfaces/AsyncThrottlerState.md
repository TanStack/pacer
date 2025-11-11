---
id: AsyncThrottlerState
title: AsyncThrottlerState
---

# Interface: AsyncThrottlerState\<TFn\>

Defined in: [async-throttler.ts:8](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L8)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../../type-aliases/AnyAsyncFunction.md)

## Properties

### errorCount

```ts
errorCount: number;
```

Defined in: [async-throttler.ts:12](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L12)

Number of function executions that have resulted in errors

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-throttler.ts:16](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L16)

Whether the throttled function is currently executing asynchronously

***

### isPending

```ts
isPending: boolean;
```

Defined in: [async-throttler.ts:20](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L20)

Whether the throttler is waiting for the timeout to trigger execution

***

### lastArgs

```ts
lastArgs: Parameters<TFn> | undefined;
```

Defined in: [async-throttler.ts:24](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L24)

The arguments from the most recent call to maybeExecute

***

### lastExecutionTime

```ts
lastExecutionTime: number;
```

Defined in: [async-throttler.ts:28](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L28)

Timestamp of the last function execution in milliseconds

***

### lastResult

```ts
lastResult: ReturnType<TFn> | undefined;
```

Defined in: [async-throttler.ts:32](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L32)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-throttler.ts:36](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L36)

Number of times maybeExecute has been called (for reduction calculations)

***

### nextExecutionTime

```ts
nextExecutionTime: number | undefined;
```

Defined in: [async-throttler.ts:40](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L40)

Timestamp when the next execution can occur in milliseconds

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-throttler.ts:44](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L44)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "pending" | "executing" | "settled";
```

Defined in: [async-throttler.ts:48](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L48)

Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed

***

### successCount

```ts
successCount: number;
```

Defined in: [async-throttler.ts:52](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-throttler.ts#L52)

Number of function executions that have completed successfully
