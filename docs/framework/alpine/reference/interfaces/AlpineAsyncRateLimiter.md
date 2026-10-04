---
id: AlpineAsyncRateLimiter
title: AlpineAsyncRateLimiter
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L21)

A AsyncRateLimiter with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncRateLimiter`\<`TFn`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncRateLimiterOptions<TFn> & AlpineAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineAsyncRateLimiterOptions`](AlpineAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
