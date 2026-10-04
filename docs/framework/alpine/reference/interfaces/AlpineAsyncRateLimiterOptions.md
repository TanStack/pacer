---
id: AlpineAsyncRateLimiterOptions
title: AlpineAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:12](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L12)

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

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:17](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineAsyncRateLimiter`](AlpineAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
