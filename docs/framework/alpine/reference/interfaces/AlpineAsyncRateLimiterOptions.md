---
id: AlpineAsyncRateLimiterOptions
title: AlpineAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L13)

Options for createAsyncRateLimiter, including owner cleanup.

## Extends

- `AsyncRateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncRateLimiter`](AlpineAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
