---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L33)

## Extends

- `Pick`\<`AsyncRateLimiter`\<`TFn`\>,
  \| `"maybeExecute"`
  \| `"getRemainingInWindow"`
  \| `"getMsUntilNextWindow"`
  \| `"getAbortSignal"`
  \| `"abort"`
  \| `"reset"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### asyncRetryers

```ts
readonly asyncRetryers: Signal<Map<number, AsyncRetryer<TFn>>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:57](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L57)

***

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:46](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L46)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L45)

***

### options

```ts
readonly options: Signal<AsyncRateLimiterOptions<TFn> & AngularAsyncRateLimiterOptions<TFn, TSelected>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:47](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L47)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:54](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L54)

#### Parameters

##### options

`Partial`\<[`AngularAsyncRateLimiterOptions`](AngularAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:53](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L53)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncRateLimiterState<TFn>>, never>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:52](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L52)

Core store access; use state() for reactive selected state.
