---
id: AngularRateLimiter
title: AngularRateLimiter
---

Defined in: [rate-limiter/injectRateLimiter.ts:31](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L31)

## Extends

- `Pick`\<`RateLimiter`\<`TFn`\>,
  \| `"maybeExecute"`
  \| `"getRemainingInWindow"`
  \| `"getMsUntilNextWindow"`
  \| `"reset"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:39](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L39)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:38](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L38)

***

### options

```ts
readonly options: Signal<RateLimiterOptions<TFn> & AngularRateLimiterOptions<TFn, TSelected>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:40](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L40)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/injectRateLimiter.ts:46](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L46)

#### Parameters

##### options

`Partial`\<[`AngularRateLimiterOptions`](AngularRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L45)

***

### store

```ts
readonly store: Signal<Store<Readonly<RateLimiterState>, never>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L44)

Core store access; use state() for reactive selected state.
