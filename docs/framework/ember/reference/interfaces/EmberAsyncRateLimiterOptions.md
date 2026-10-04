---
id: EmberAsyncRateLimiterOptions
title: EmberAsyncRateLimiterOptions
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L17)

Options for useAsyncRateLimiter, including owner cleanup.

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

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L22)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberAsyncRateLimiter`](EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
