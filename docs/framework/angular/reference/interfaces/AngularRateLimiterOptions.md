---
id: AngularRateLimiterOptions
title: AngularRateLimiterOptions
---

Defined in: packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:22

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

Defined in: packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts:29

Called when the owning injection context is destroyed. Receives the core instance.
Providing this callback replaces the default cleanup (reset the limiter).

#### Parameters

##### core

`RateLimiter`\<`TFn`\>

#### Returns

`void`
