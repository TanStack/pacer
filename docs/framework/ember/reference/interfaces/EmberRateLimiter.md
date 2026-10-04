---
id: EmberRateLimiter
title: EmberRateLimiter
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L26)

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
options: RateLimiterOptions<TFn> & EmberRateLimiterOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L31)

#### Parameters

##### options

`Partial`\<[`EmberRateLimiterOptions`](EmberRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:35](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.
