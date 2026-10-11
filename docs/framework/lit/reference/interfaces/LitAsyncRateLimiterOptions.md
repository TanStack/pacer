---
id: LitAsyncRateLimiterOptions
title: LitAsyncRateLimiterOptions
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:14](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L14)

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

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L19)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`LitAsyncRateLimiter`](LitAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
