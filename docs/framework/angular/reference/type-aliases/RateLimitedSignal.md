---
id: RateLimitedSignal
title: RateLimitedSignal
---

# Type Alias: RateLimitedSignal\<TValue, TSelected\>

```ts
type RateLimitedSignal<TValue, TSelected> = (...args) => TValue & object;
```

Defined in: [rate-limiter/injectRateLimitedSignal.ts:11](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L11)

## Type Declaration

### rateLimiter

```ts
readonly rateLimiter: AngularRateLimiter<Setter<TValue>, TSelected>;
```

The rate limiter instance with additional control methods and state signals.

### set

```ts
readonly set: Setter<TValue>;
```

Set or update the rate-limited value. This calls `rateLimiter.maybeExecute(...)`.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
