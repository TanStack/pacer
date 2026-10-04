---
id: EmberAsyncRateLimiter
title: EmberAsyncRateLimiter
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:28](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L28)

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
options: AsyncRateLimiterOptions<TFn> & EmberAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L32)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:34](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L34)

#### Parameters

##### options

`Partial`\<[`EmberAsyncRateLimiterOptions`](EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:40](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L40)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: EmberPacerSubscribe<AsyncRateLimiterState<TFn>>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:38](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L38)

Selects state in a child without subscribing the utility owner.
