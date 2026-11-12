---
id: AngularRateLimiterOptions
title: AngularRateLimiterOptions
---

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L31)

Options for [injectRateLimiter](../functions/injectRateLimiter.md), including core configuration and Angular cleanup.

## Extends

- `RateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Properties

### onUnmount?

```ts
optional onUnmount?: (core) => void;
```

Defined in: [packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L38)

Called when the owning injection context is destroyed. Receives the core instance.
There is no default cleanup; use this callback for custom teardown.

#### Parameters

##### core

`RateLimiter`\<`TFn`\>

#### Returns

`void`
