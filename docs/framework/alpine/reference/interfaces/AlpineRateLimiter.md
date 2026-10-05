---
id: AlpineRateLimiter
title: AlpineRateLimiter
---

Defined in: [rate-limiter/createRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L22)

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

Defined in: [rate-limiter/createRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/createRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L28)

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

Defined in: [rate-limiter/createRateLimiter.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<RateLimiterState>;
```

Defined in: [rate-limiter/createRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/rate-limiter/createRateLimiter.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
