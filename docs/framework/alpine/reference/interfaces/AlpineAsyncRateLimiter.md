---
id: AlpineAsyncRateLimiter
title: AlpineAsyncRateLimiter
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L22)

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
options: AsyncRateLimiterOptions<TFn> & AlpineAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L28)

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

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:34](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
