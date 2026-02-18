---
id: SolidAsyncRateLimiter
title: SolidAsyncRateLimiter
---

# Interface: SolidAsyncRateLimiter\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:24](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L24)

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
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:50](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L50)

Reactive state that will be updated when the rate limiter state changes

Use this instead of `rateLimiter.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>;
```

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:56](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L56)

#### Deprecated

Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts:41](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-rate-limiter/createAsyncRateLimiter.ts#L41)

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
<rateLimiter.Subscribe selector={(state) => ({ rejectionCount: state.rejectionCount, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>Rejected: {state().rejectionCount}, {state().isExecuting ? 'Executing' : 'Idle'}</div>
  )}
</rateLimiter.Subscribe>
```
