---
id: OctaneAsyncRateLimiter
title: OctaneAsyncRateLimiter
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L25)

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
options: AsyncRateLimiterOptions<TFn> & OctaneAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L31)

#### Parameters

##### options

`Partial`\<[`OctaneAsyncRateLimiterOptions`](OctaneAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:37](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L37)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:35](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L35)

Selects state in a child without subscribing the utility owner.
