---
id: RateLimitedSignal
title: RateLimitedSignal
---

# Interface: RateLimitedSignal()\<TValue, TSelected\>

Defined in: [angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:11](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L11)

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

```ts
RateLimitedSignal(): TValue;
```

Defined in: [angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L12)

## Returns

`TValue`

## Properties

### rateLimiter

```ts
rateLimiter: AngularRateLimiter<Setter<TValue>, TSelected>;
```

Defined in: [angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:14](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L14)

***

### set

```ts
set: Setter<TValue>;
```

Defined in: [angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts:13](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimitedSignal.ts#L13)
