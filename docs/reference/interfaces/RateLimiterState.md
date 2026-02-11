---
id: RateLimiterState
title: RateLimiterState
---

# Interface: RateLimiterState

Defined in: [rate-limiter.ts:6](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L6)

## Properties

### executionCount

```ts
executionCount: number;
```

Defined in: [rate-limiter.ts:10](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L10)

Number of function executions that have been completed

***

### executionTimes

```ts
executionTimes: number[];
```

Defined in: [rate-limiter.ts:14](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L14)

Array of timestamps when executions occurred for rate limiting calculations

***

### isExceeded

```ts
isExceeded: boolean;
```

Defined in: [rate-limiter.ts:18](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L18)

Whether the rate limiter has exceeded the limit

***

### maybeExecuteCount

```ts
maybeExecuteCount: number;
```

Defined in: [rate-limiter.ts:22](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L22)

Number of times maybeExecute has been called (for reduction calculations)

***

### rejectionCount

```ts
rejectionCount: number;
```

Defined in: [rate-limiter.ts:26](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L26)

Number of function executions that have been rejected due to rate limiting

***

### status

```ts
status: "disabled" | "idle" | "exceeded";
```

Defined in: [rate-limiter.ts:30](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/rate-limiter.ts#L30)

Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
