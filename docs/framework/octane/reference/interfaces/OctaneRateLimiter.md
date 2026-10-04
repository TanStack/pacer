---
id: OctaneRateLimiter
title: OctaneRateLimiter
---

Defined in: [rate-limiter/useRateLimiter.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L23)

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
options: RateLimiterOptions<TFn> & OctaneRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/useRateLimiter.ts:27](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L27)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/useRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L29)

#### Parameters

##### options

`Partial`\<[`OctaneRateLimiterOptions`](OctaneRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [rate-limiter/useRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/rate-limiter/useRateLimiter.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.
