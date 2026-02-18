---
id: ReactAsyncThrottler
title: ReactAsyncThrottler
---

# Interface: ReactAsyncThrottler\<TFn, TSelected\>

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:24](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L24)

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"store"`\>

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

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:50](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L50)

Reactive state that will be updated and re-rendered when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:56](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L56)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => ReactNode | Promise<ReactNode>;
```

Defined in: [react-pacer/src/async-throttler/useAsyncThrottler.ts:41](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/async-throttler/useAsyncThrottler.ts#L41)

A React HOC (Higher Order Component) that allows you to subscribe to the throttler state.

This is useful for opting into state re-renders for specific parts of the throttler state
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
<throttler.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {({ isExecuting }) => (
    <div>{isExecuting ? 'Loading...' : 'Ready'}</div>
  )}
</throttler.Subscribe>
```
