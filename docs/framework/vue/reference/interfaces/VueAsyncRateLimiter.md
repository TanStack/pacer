---
id: VueAsyncRateLimiter
title: VueAsyncRateLimiter
---

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L22)

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
options: AsyncRateLimiterOptions<TFn> & VueAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L28)

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

Defined in: [async-rate-limiter/useAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L32)

Selected state. Pass a selector to opt in; the default selection is an empty object.
