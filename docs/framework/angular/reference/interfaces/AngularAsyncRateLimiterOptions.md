---
id: AngularAsyncRateLimiterOptions
title: AngularAsyncRateLimiterOptions
---

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L32)

Options for [injectAsyncRateLimiter](../functions/injectAsyncRateLimiter.md), including core configuration and Angular cleanup.

## Extends

- `AsyncRateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L39)

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (abort running work).

#### Parameters

##### core

`AsyncRateLimiter`\<`TFn`\>

#### Returns

`void`
