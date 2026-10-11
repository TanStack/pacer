---
id: LitAsyncRateLimiter
title: LitAsyncRateLimiter
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L23)

An AsyncRateLimiter with framework-reactive selected state. All core methods remain available.

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
options: AsyncRateLimiterOptions<TFn> & LitAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L29)

#### Parameters

##### options

`Partial`\<[`LitAsyncRateLimiterOptions`](LitAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:35](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L33)

Subscribes a child owner to selected state with automatic cleanup.
