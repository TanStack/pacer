---
id: VueAsyncRateLimiter
title: VueAsyncRateLimiter
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L23)

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
options: AsyncRateLimiterOptions<TFn> & VueAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L29)

#### Parameters

##### options

`Partial`\<[`VueAsyncRateLimiterOptions`](VueAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:35](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<AsyncRateLimiterState<TFn>>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L33)

Subscribes a scoped slot to state without re-rendering the utility owner.
