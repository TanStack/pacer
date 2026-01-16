---
id: PreactAsyncRateLimiter
title: PreactAsyncRateLimiter
---

# Interface: PreactAsyncRateLimiter\<TFn, TSelected\>

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:13](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L13)

## Extends

- `Omit`\<`AsyncRateLimiter`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L39)

Reactive state that will be updated and re-rendered when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:45](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L45)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ComponentChildren;
```

Defined in: [preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:30](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L30)

A Preact HOC (Higher Order Component) that allows you to subscribe to the async rate limiter state.

This is useful for opting into state re-renders for specific parts of the rate limiter state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ComponentChildren` \| (`state`) => `ComponentChildren`

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
