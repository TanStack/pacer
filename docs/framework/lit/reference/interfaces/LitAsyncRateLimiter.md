---
id: LitAsyncRateLimiter
title: LitAsyncRateLimiter
---

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L22)

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
options: AsyncRateLimiterOptions<TFn> & LitAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L28)

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

Defined in: [async-rate-limiter/createAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.
