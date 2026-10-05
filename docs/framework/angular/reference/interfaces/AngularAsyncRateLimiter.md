---
id: AngularAsyncRateLimiter
title: AngularAsyncRateLimiter
---

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L26)

## Extends

- `Omit`\<`AsyncRateLimiter`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncRateLimiterOptions<TFn> & AngularAsyncRateLimiterOptions<TFn, TSelected>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:32](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L32)

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

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:40](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L40)

Reactive state signal that will be updated when the async rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [async-rate-limiter/injectAsyncRateLimiter.ts:45](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-rate-limiter/injectAsyncRateLimiter.ts#L45)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
