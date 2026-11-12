---
id: LitRateLimiter
title: LitRateLimiter
---

Defined in: [rate-limiter/createRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L23)

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
options: RateLimiterOptions<TFn> & LitRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/createRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L28)

#### Parameters

##### options

`Partial`\<[`LitRateLimiterOptions`](LitRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<RateLimiterState>;
```

Defined in: [rate-limiter/createRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/rate-limiter/createRateLimiter.ts#L30)

Subscribes a child owner to selected state with automatic cleanup.
