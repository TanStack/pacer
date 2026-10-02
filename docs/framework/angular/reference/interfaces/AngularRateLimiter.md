---
id: AngularRateLimiter
title: AngularRateLimiter
---

Defined in: [rate-limiter/injectRateLimiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L25)

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: RateLimiterOptions<TFn> & AngularRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:29](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/injectRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L31)

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

Defined in: [rate-limiter/injectRateLimiter.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L39)

Reactive state signal that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter/injectRateLimiter.ts:44](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/rate-limiter/injectRateLimiter.ts#L44)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
