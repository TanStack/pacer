---
id: RateLimitedSignal
title: RateLimitedSignal
---

```ts
type RateLimitedSignal<TValue, TSelected> = Signal<TValue> & object;
```

Defined in: [rate-limiter/injectRateLimitedSignal.ts:13](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L13)

## Type Declaration

### rateLimiter

```ts
rateLimiter: AngularRateLimiter<Setter<TValue>, TSelected>;
```

### set

```ts
set: Setter<TValue>;
```

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}
