---
id: ReactRateLimiter
title: ReactRateLimiter
---

# Interface: ReactRateLimiter\<TFn, TSelected\>

Defined in: [react-pacer/src/rate-limiter/useRateLimiter.ts:13](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimiter.ts#L13)

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

Defined in: [react-pacer/src/rate-limiter/useRateLimiter.ts:39](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimiter.ts#L39)

Reactive state that will be updated and re-rendered when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<RateLimiterState>>;
```

Defined in: [react-pacer/src/rate-limiter/useRateLimiter.ts:45](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimiter.ts#L45)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/rate-limiter/useRateLimiter.ts:30](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/rate-limiter/useRateLimiter.ts#L30)

A React HOC (Higher Order Component) that allows you to subscribe to the rate limiter state.

This is useful for opting into state re-renders for specific parts of the rate limiter state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`ReactNode` \| (`state`) => `ReactNode`

###### selector

(`state`) => `TSelected`

#### Returns

`ReactNode` \| `Promise`\<`ReactNode`\>

#### Example

```ts
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount })}>
  {({ rejectionCount }) => (
    <div>Rejected: {rejectionCount} requests</div>
  )}
</rateLimiter.Subscribe>
```
