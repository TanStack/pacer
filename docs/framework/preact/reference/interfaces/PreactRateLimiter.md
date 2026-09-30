---
id: PreactRateLimiter
title: PreactRateLimiter
---

Defined in: [rate-limiter/useRateLimiter.ts:25](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L25)

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
readonly state: Readonly<TSelected>;
```

Defined in: [rate-limiter/useRateLimiter.ts:51](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L51)

Reactive state that will be updated and re-rendered when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [rate-limiter/useRateLimiter.ts:57](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L57)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useSelector` hook internally.
Although, you can make the state reactive by using the `useSelector` in your own usage.

***

### Subscribe

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [rate-limiter/useRateLimiter.ts:42](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/rate-limiter/useRateLimiter.ts#L42)

A Preact HOC (Higher Order Component) that allows you to subscribe to the rate limiter state.

This is useful for opting into state re-renders for specific parts of the rate limiter state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ComponentChildren` \| ((`state`) => `ComponentChildren`)

###### selector

(`state`) => `TSelected`

#### Returns

`ComponentChildren`

#### Example

```ts
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {({ rejectionCount }) => (
    <div>Rejections: {rejectionCount}</div>
  )}
</rateLimiter.Subscribe>
```
