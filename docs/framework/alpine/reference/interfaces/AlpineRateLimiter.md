---
id: AlpineRateLimiter
title: AlpineRateLimiter
---

Defined in: [rate-limiter/createRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L21)

A RateLimiter with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: RateLimiterOptions<TFn> & AlpineRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/createRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineRateLimiterOptions`](AlpineRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
