---
id: SolidRateLimiter
title: SolidRateLimiter
---

# Interface: SolidRateLimiter\<TFn, TSelected\>

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L12)

## Extends

- `Omit`\<`RateLimiter`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:38](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L38)

Reactive state that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:44](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L44)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/rate-limiter/createRateLimiter.ts:29](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/rate-limiter/createRateLimiter.ts#L29)

A Solid component that allows you to subscribe to the rate limiter state.

This is useful for tracking specific parts of the rate limiter state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| (`state`) => `Element`

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
