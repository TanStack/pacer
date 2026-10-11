---
id: AsyncRateLimiterState
title: AsyncRateLimiterState
---

Defined in: [async-rate-limiter.ts:9](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L9)

## Type Parameters

### TFn

`TFn` *extends* [`AnyAsyncFunction`](../type-aliases/AnyAsyncFunction.md)

## Properties

### errorCount

```ts
errorCount: number;
```

Defined in: [async-rate-limiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L13)

Number of function executions that have resulted in errors

***

### executionTimes

```ts
executionTimes: number[];
```

Defined in: [async-rate-limiter.ts:17](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L17)

Array of timestamps when executions occurred for rate limiting calculations

***

### isExceeded

```ts
isExceeded: boolean;
```

Defined in: [async-rate-limiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L21)

Whether the rate limiter has exceeded the limit

***

### isExecuting

```ts
isExecuting: boolean;
```

Defined in: [async-rate-limiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L25)

Whether the rate-limited function is currently executing asynchronously

***

### lastResult

```ts
lastResult: Awaited<ReturnType<TFn>> | undefined;
```

Defined in: [async-rate-limiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L29)

The result from the most recent successful function execution

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [async-rate-limiter.ts:49](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L49)

Number of times maybeExecute has been called (for reduction calculations)

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [async-rate-limiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L33)

Number of function executions that have been rejected due to rate limiting

***

### settleCount

```ts
settleCount: number;
```

Defined in: [async-rate-limiter.ts:37](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L37)

Number of function executions that have completed (either successfully or with errors)

***

### status

```ts
status: "disabled" | "idle" | "executing" | "exceeded";
```

Defined in: [async-rate-limiter.ts:41](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L41)

Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded

***

### successCount

```ts
successCount: number;
```

Defined in: [async-rate-limiter.ts:45](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-rate-limiter.ts#L45)

Number of function executions that have completed successfully
