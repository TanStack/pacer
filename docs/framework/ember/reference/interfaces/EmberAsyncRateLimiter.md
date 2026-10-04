---
id: EmberAsyncRateLimiter
title: EmberAsyncRateLimiter
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L26)

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
options: AsyncRateLimiterOptions<TFn> & EmberAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L32)

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

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:36](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L36)

Selected state. Pass a selector to opt in; the default selection is an empty object.
