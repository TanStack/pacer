---
id: SolidRateLimiter
title: SolidRateLimiter
---

Defined in: [rate-limiter/createRateLimiter.ts:26](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L26)

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: RateLimiterOptions<TFn> & SolidRateLimiterOptions<TFn, TSelected>;
```

Defined in: [rate-limiter/createRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L30)

#### Overrides

```ts
Omit.options
```

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [rate-limiter/createRateLimiter.ts:31](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L31)

Updates the rate limiter options

#### Parameters

##### options

`Partial`\<[`SolidRateLimiterOptions`](SolidRateLimiterOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

#### Overrides

```ts
Omit.setOptions
```

***

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [rate-limiter/createRateLimiter.ts:57](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L57)

Reactive state that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter/createRateLimiter.ts:63](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L63)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [rate-limiter/createRateLimiter.ts:48](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L48)

A Solid component that allows you to subscribe to the rate limiter state.

This is useful for tracking specific parts of the rate limiter state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| ((`state`) => `Element`)

###### selector

(`state`) => `TSelected`

#### Returns

`Element`

#### Example

```ts
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {(state) => (
    <div>Rejections: {state().rejectionCount}</div>
  )}
</rateLimiter.Subscribe>
```
