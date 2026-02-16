---
id: AsyncRateLimiterState
title: AsyncRateLimiterState
---

# Interface: AsyncRateLimiterState\<TFn\>

Defined in: [async-rate-limiter.ts:8](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L8)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### errorCount

```ts
errorCount: number;
```

Defined in: [async-rate-limiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L12)

Number of function executions that have resulted in errors

***

### executionTimes

```ts
executionTimes: number[];
```

Defined in: [async-rate-limiter.ts:16](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L16)

Array of timestamps when executions occurred for rate limiting calculations

***

### isExceeded

```ts
isExceeded: boolean;
```

Defined in: [async-rate-limiter.ts:20](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L20)

Whether the rate limiter has exceeded the limit

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-rate-limiter.ts:24](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L24)

Whether the rate-limited function is currently executing asynchronously

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-rate-limiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L28)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-rate-limiter.ts:48](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L48)

Number of times maybeExecute has been called (for reduction calculations)

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [async-rate-limiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L32)

Number of function executions that have been rejected due to rate limiting

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-rate-limiter.ts:36](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L36)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "executing" | "exceeded";
```

Defined in: [async-rate-limiter.ts:40](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L40)

Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded

***

### successCount

```ts
successCount: number;
```

Defined in: [async-rate-limiter.ts:44](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L44)

Number of function executions that have completed successfully
