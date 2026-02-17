---
id: ReactAsyncRateLimiter
title: ReactAsyncRateLimiter
---

# Interface: ReactAsyncRateLimiter\<TFn, TSelected\>

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:24](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L24)

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

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:50](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L50)

Reactive state that will be updated and re-rendered when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:56](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L56)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts:41](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-rate-limiter/useAsyncRateLimiter.ts#L41)

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
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount, isExecuting: state.isExecuting })}>
  {({ rejectionCount, isExecuting }) => (
    <div>Rejected: {rejectionCount}, {isExecuting ? 'Executing' : 'Idle'}</div>
  )}
</rateLimiter.Subscribe>
```
