---
id: OctaneAsyncRateLimiter
title: OctaneAsyncRateLimiter
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L23)

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
options: AsyncRateLimiterOptions<TFn> & OctaneAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L29)

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

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
