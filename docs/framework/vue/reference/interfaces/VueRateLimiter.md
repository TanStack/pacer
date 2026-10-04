---
id: VueRateLimiter
title: VueRateLimiter
---

Defined in: [rate-limiter/useRateLimiter.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L22)

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
options: RateLimiterOptions<TFn> & VueRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/useRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/useRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L27)

#### Parameters

##### options

`Partial`\<[`VueRateLimiterOptions`](VueRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [rate-limiter/useRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/rate-limiter/useRateLimiter.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
