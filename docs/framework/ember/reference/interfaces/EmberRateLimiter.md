---
id: EmberRateLimiter
title: EmberRateLimiter
---

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L28)

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

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:33](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L33)

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

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:39](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L39)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<RateLimiterState>;
```

Defined in: [packages/ember-pacer/src/rate-limiter/useRateLimiter.ts:37](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/rate-limiter/useRateLimiter.ts#L37)

Selects state in a child without subscribing the utility owner.
