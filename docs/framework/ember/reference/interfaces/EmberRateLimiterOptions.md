---
id: EmberRateLimiterOptions
title: EmberRateLimiterOptions
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:17](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L17)

Options for useRateLimiter, including owner cleanup.

## Extends

- `RateLimiterOptions`\<`TFn`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L22)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberRateLimiter`](EmberRateLimiter.md)\<`TFn`, `TSelected`\>

#### Returns

`void`
